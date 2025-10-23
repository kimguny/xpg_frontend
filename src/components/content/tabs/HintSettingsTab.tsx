'use client';

import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, CircularProgress, List, ListItem, ListItemText, TextField } from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useGetHints } from '@/hooks/query/useGetHints';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { HintCreatePayload } from '@/lib/api/admin';

// 5개의 프리셋 폼 컴포넌트를 import 합니다.
import CardSwipeForm from './hint-presets/CardSwipeForm';
import TopImageForm from './hint-presets/TopImageForm';
import MiddleImageForm from './hint-presets/MiddleImageForm';
import TimeAttackForm from './hint-presets/TimeAttackForm';
import ArCameraForm from './hint-presets/ArCameraForm';

interface HintSettingsTabProps {
  stageId?: string;
}

// 전체 폼 데이터 타입을 export하여 자식 컴포넌트에서도 사용할 수 있게 합니다.
export type FullHintFormData = {
  preset: 'cardSwipe' | 'topImage' | 'middleImage' | 'timeAttack' | 'arCamera';
  nfc_id: string | null;
  reward_coin: number | string;
  cardSwipe: { cards: { title: string; text: string }[] };
  topImage: { imageUrl: string; textBlocks: { text: string }[] };
  middleImage: { topText: string; mediaUrl: string; bottomText: string };
  timeAttack: { timeLimit: string; bottomText: string };
  arCamera: { imageUrl: string };
};

export default function HintSettingsTab({ stageId }: HintSettingsTabProps) {
  const { data: hints, isLoading: isLoadingHints } = useGetHints(stageId);
  const createHintMutation = useCreateHint(stageId);

  const { control, handleSubmit, watch, reset } = useForm<FullHintFormData>({
    defaultValues: {
      preset: 'cardSwipe',
      nfc_id: '',
      reward_coin: '',
      cardSwipe: { cards: [{ title: '', text: '' }] },
      topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
      middleImage: { topText: '', mediaUrl: '', bottomText: '' },
      timeAttack: { timeLimit: '', bottomText: '' },
      arCamera: { imageUrl: '' },
    },
  });

  const selectedPreset = watch('preset');

  // ✨ 1. onSubmit 로직을 완성합니다. (payload 생성 및 mutate 호출)
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    // API로 보낼 payload를 담을 변수들을 준비합니다.
    let text_blocks: string[] = [];
    let cooldown_sec = 0; // 타임어택용

    // 선택된 프리셋(data.preset)에 따라 폼 데이터를 가공합니다.
    switch (data.preset) {
      case 'cardSwipe':
        // 카드 제목과 내용을 '|' 문자로 합쳐서 text_blocks 배열에 저장합니다.
        text_blocks = data.cardSwipe.cards.map(card => `${card.title || ''}|${card.text || ''}`);
        break;
      case 'topImage':
        text_blocks = data.topImage.textBlocks.map(block => block.text || '');
        break;
      case 'middleImage':
        text_blocks = [data.middleImage.topText, data.middleImage.bottomText];
        break;
      case 'timeAttack':
        text_blocks = [data.timeAttack.bottomText];
        cooldown_sec = Number(data.timeAttack.timeLimit) || 0;
        break;
      case 'arCamera':
        // AR 카메라는 텍스트 블록이 없을 수 있습니다. (이미지 URL은 별도 처리 필요)
        text_blocks = [];
        break;
    }

    // 최종 API 페이로드를 조립합니다.
    const payload: HintCreatePayload = {
      preset: data.preset,
      order_no: (hints?.length || 0) + 1,
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.nfc_id || null,
      text_blocks: text_blocks.filter(t => t !== '|'), // 내용이 완전히 빈 블록은 제외
      cooldown_sec: cooldown_sec,
    };
    
    // API 호출을 실행합니다.
    createHintMutation.mutate(payload, {
      onSuccess: () => {
        alert('새로운 힌트가 추가되었습니다.');
        reset(); // 성공 시 폼 리셋
      },
    });
  };

  if (isLoadingHints) {
    return <CircularProgress />;
  }
  
  const renderPresetForm = () => {
    switch (selectedPreset) {
      // ✨ 2. 자식 컴포넌트에는 control prop만 전달하도록 정리합니다.
      case 'cardSwipe':
        return <CardSwipeForm control={control} />;
      case 'topImage':
        return <TopImageForm control={control} />;
      case 'middleImage':
        return <MiddleImageForm control={control} />;
      case 'timeAttack':
        return <TimeAttackForm control={control} />;
      case 'arCamera':
        return <ArCameraForm control={control} />;
      default:
        return null;
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>힌트 목록</Typography>
      <List dense sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
        {hints && hints.length > 0 ? (
          hints.map((hint, index) => (
            <ListItem key={hint.id} divider={index < hints.length - 1}>
              <ListItemText 
                primary={`#${hint.order_no}: ${hint.text_block_1 || '(내용 없음)'}`} 
                secondary={`프리셋: ${hint.preset}`} 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="등록된 힌트가 없습니다." />
          </ListItem>
        )}
      </List>
      
      {/* ✨ 3. <form> 태그를 제거하여 중첩 오류를 해결합니다. */}
      <Box>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ fontWeight: 600 }}>1. 힌트 스타일 설정</FormLabel>
          <Controller name="preset" control={control} render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel value="cardSwipe" control={<Radio />} label="카드 스와이프형" />
              <FormControlLabel value="topImage" control={<Radio />} label="상단 이미지형" />
              <FormControlLabel value="middleImage" control={<Radio />} label="중간 이미지형" />
              <FormControlLabel value="timeAttack" control={<Radio />} label="타임어택형" />
              <FormControlLabel value="arCamera" control={<Radio />} label="AR 카메라형" />
            </RadioGroup>
          )}/>
        </FormControl>

        {renderPresetForm()}
        
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>공통 설정</Typography>
          <Controller name="nfc_id" control={control} render={({ field }) => <TextField {...field} label="연계 NFC ID (선택)" fullWidth sx={{ mb: 2 }} />} />
          <Controller name="reward_coin" control={control} render={({ field }) => <TextField {...field} type="number" label="클리어 보상 (코인)" />} />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          {/* ✨ 4. Button의 type을 "button"으로, onClick 이벤트로 제출 함수를 호출합니다. */}
          <Button 
            type="button" 
            variant="contained" 
            onClick={handleSubmit(onSubmit)} 
            disabled={createHintMutation.isPending}
          >
            {createHintMutation.isPending ? '힌트 추가 중...' : '힌트 추가'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}