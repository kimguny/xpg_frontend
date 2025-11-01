'use client';

import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, CircularProgress, List, ListItem, ListItemText, TextField, Select, MenuItem, InputLabel, FormHelperText } from '@mui/material';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
// 1. 필요한 타입과 API 함수를 import합니다.
import { 
  HintCreatePayload, 
  Hint,
  PaginatedResponse, 
  NfcTag, 
  getAdminNfcTags 
} from '@/lib/api/admin';

// 5개의 프리셋 폼 컴포넌트를 import 합니다.
import CardSwipeForm from './hint-presets/CardSwipeForm';
import TopImageForm from './hint-presets/TopImageForm';
import MiddleImageForm from './hint-presets/MiddleImageForm';
import TimeAttackForm from './hint-presets/TimeAttackForm';
import ArCameraForm from './hint-presets/ArCameraForm';

// 2. Props 인터페이스에 `hints: Hint[]`를 추가합니다.
interface HintSettingsTabProps {
  stageId?: string;
  hints: Hint[]; 
}

// 전체 폼 데이터 타입
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

// 3. `hints`를 props로 받도록 수정합니다.
export default function HintSettingsTab({ stageId, hints }: HintSettingsTabProps) {
  // 4. useGetHints 훅을 제거합니다. (데이터는 prop으로 받음)
  
  const createHintMutation = useCreateHint(stageId);

  // 5. NFC 태그 목록은 계속 여기서 불러옵니다.
  const { data: nfcData, isLoading: isLoadingNfcTags } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    queryFn: () => getAdminNfcTags(),
  });

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

  // '새 힌트 추가' 폼 제출 로직
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let cooldown_sec = 0; 
    switch (data.preset) {
      case 'cardSwipe':
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
        text_blocks = [];
        break;
    }
    const payload: HintCreatePayload = {
      preset: data.preset,
      order_no: (hints?.length || 0) + 1, // `hints` prop을 사용
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.nfc_id || null, 
      text_blocks: text_blocks.filter(t => t !== '|'), 
      cooldown_sec: cooldown_sec,
    };
    
    createHintMutation.mutate(payload, {
      onSuccess: () => {
        alert('새로운 힌트가 추가되었습니다.');
        reset(); 
        // (참고: 목록 실시간 갱신을 위해 queryClient.invalidateQueries 필요)
      },
    });
  };

  // 6. isLoadingNfcTags만 확인합니다.
  if (isLoadingNfcTags) {
    return <CircularProgress />;
  }
  
  // 7. 프리셋 폼 렌더링 함수 (생략 없이 전체 포함)
  const renderPresetForm = () => {
    switch (selectedPreset) {
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
      {/* 8. 힌트 목록을 `hints` prop 기준으로 렌더링합니다. */}
      <List dense sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
        {hints && hints.length > 0 ? (
          hints.map((hint, index) => (
            <ListItem 
              key={hint.id} 
              divider={index < hints.length - 1}
              // (참고: 추후 '수정' 기능을 위해 onClick 핸들러 추가 필요)
              // onClick={() => handleHintSelect(hint)} 
            >
              <ListItemText 
                primary={`${hint.order_no}: ${hint.text_block_1 || '(내용 없음)'}`} 
                secondary={`프리셋: ${hint.preset} / NFC: ${hint.nfc ? hint.nfc.tag_name : '없음'}`} 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="등록된 힌트가 없습니다." />
          </ListItem>
        )}
      </List>
      
      {/* 9. '새 힌트 추가' 폼 */}
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>새 힌트 추가</Typography>
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="nfc-select-label">연계 NFC (선택)</InputLabel>
            <Controller
              name="nfc_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="nfc-select-label"
                  label="연계 NFC (선택)"
                  value={field.value || ''} 
                >
                  <MenuItem value="">
                    <em>선택 안 함</em>
                  </MenuItem>
                  {nfcData?.items.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.tag_name} (ID: {tag.id.substring(0, 8)}...)
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {!nfcData?.items.length && (
              <FormHelperText>등록된 NFC 태그가 없습니다.</FormHelperText>
            )}
          </FormControl>

          <Controller name="reward_coin" control={control} render={({ field }) => <TextField {...field} type="number" label="클리어 보상 (코인)" />} />
        </Box>
        
        <Box sx={{ mt: 3 }}>
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