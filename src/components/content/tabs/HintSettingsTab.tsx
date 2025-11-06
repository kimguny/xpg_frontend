'use client';

// [1. 수정] FormProvider, useForm, useQueryClient 추가
import { Box, Button, TextField, Typography, IconButton, FormLabel, FormControl, CircularProgress, List, ListItem, ListItemText, Select, MenuItem, InputLabel, FormHelperText, RadioGroup, FormControlLabel, Radio, Divider } from '@mui/material';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { useDeleteHint } from '@/hooks/mutation/useDeleteHint'; // [2. 추가] 힌트 삭제 훅
import { Delete as DeleteIcon } from '@mui/icons-material'; // [3. 추가] 삭제 아이콘
import { 
  HintCreatePayload, 
  Hint,
  PaginatedResponse, 
  NfcTag, 
  getAdminNfcTags 
} from '@/lib/api/admin';

import CardSwipeForm from './hint-presets/CardSwipeForm';
import TopImageForm from './hint-presets/TopImageForm';
import MiddleImageForm from './hint-presets/MiddleImageForm';
import TimeAttackForm from './hint-presets/TimeAttackForm';

interface HintSettingsTabProps {
  stageId?: string;
  hints: Hint[]; 
}

// [4. 수정] FullHintFormData 타입: cardSwipe 로직 변경 (카드당 이미지)
export type FullHintFormData = {
  preset: 'cardSwipe' | 'topImage' | 'middleImage' | 'timeAttack';
  nfc_id: string | null;
  reward_coin: number | string;
  cardSwipe: { 
    cards: { 
      title: string; 
      text: string;
      imageUrl: string; // [5. 수정] 카드 1개당 이미지는 1개 (스크린샷 기준)
    }[];
  };
  topImage: { imageUrl: string; textBlocks: { text: string }[] };
  middleImage: { topText: string; mediaUrl: string; bottomText: string };
  timeAttack: { timeLimit: string; bottomText: string };
};

export default function HintSettingsTab({ stageId, hints }: HintSettingsTabProps) {
  
  const queryClient = useQueryClient();
  const createHintMutation = useCreateHint(stageId);
  const deleteHintMutation = useDeleteHint(); // [6. 추가] 삭제 훅 사용

  const { data: nfcData, isLoading: isLoadingNfcTags } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    queryFn: () => getAdminNfcTags(),
  });

  // [7. 수정] useForm을 methods로 정의 (ts(2739) 오류 해결)
  const methods = useForm<FullHintFormData>({
    defaultValues: {
      preset: 'cardSwipe',
      nfc_id: '',
      reward_coin: '',
      cardSwipe: { 
        cards: [{ title: '', text: '', imageUrl: '' }] // imageUrl 기본값 추가
      },
      topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
      middleImage: { topText: '', mediaUrl: '', bottomText: '' },
      timeAttack: { timeLimit: '', bottomText: '' },
    },
  });

  const { control, handleSubmit, watch, reset } = methods;
  const selectedPreset = watch('preset');

  // [8. 수정] onSubmit 로직: payload.images를 cardSwipe에서 추출
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let images: { url: string; alt_text?: string; order_no: number }[] = [];
    let cooldown_sec = 0; 

    switch (data.preset) {
      case 'cardSwipe':
        text_blocks = data.cardSwipe.cards.map(card => `${card.title || ''}|${card.text || ''}`);
        // 카드 스와이프의 이미지는 images 필드로 별도 전송 (스크린샷 1의 "5. 이미지 등록" 기준)
        // (만약 각 카드에 이미지가 귀속된다면 백엔드 API 스키마 변경이 필요함)
        // [수정] 스키마(HintCreate)에 맞게 images 배열을 생성합니다.
        images = data.cardSwipe.cards
          .map((card, i) => ({
            url: card.imageUrl,
            alt_text: card.title || `Card Image ${i + 1}`,
            order_no: i + 1,
          }))
          .filter(img => img.url); // URL이 있는 이미지만 필터링
        break;
      case 'topImage':
        text_blocks = data.topImage.textBlocks.map(block => block.text || '');
        if (data.topImage.imageUrl) {
          images = [{ url: data.topImage.imageUrl, alt_text: 'Top Image', order_no: 1 }];
        }
        break;
      case 'middleImage':
        text_blocks = [data.middleImage.topText, data.middleImage.bottomText];
        if (data.middleImage.mediaUrl) {
          images = [{ url: data.middleImage.mediaUrl, alt_text: 'Middle Image', order_no: 1 }];
        }
        break;
      case 'timeAttack':
        text_blocks = [data.timeAttack.bottomText];
        cooldown_sec = Number(data.timeAttack.timeLimit) || 0;
        break;
    }

    const payload: HintCreatePayload = {
      preset: data.preset,
      order_no: (hints?.length || 0) + 1, 
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.nfc_id || null, 
      text_blocks: text_blocks.filter(t => t && t !== '|'), 
      images: images, 
      cooldown_sec: cooldown_sec,
    };
    
    createHintMutation.mutate(payload, {
      onSuccess: () => {
        alert('새로운 힌트가 추가되었습니다.');
        reset(); 
        queryClient.invalidateQueries({ queryKey: ['adminStageById', stageId] });
      },
      onError: (err) => {
        alert(`힌트 추가 실패: ${err.message}`);
      }
    });
  };

  // [9. 추가] 힌트 삭제 핸들러
  const handleDeleteHint = (hintId: string) => {
    if (confirm('이 힌트를 정말 삭제하시겠습니까?')) {
      deleteHintMutation.mutate({ hintId, stageId });
    }
  };

  if (isLoadingNfcTags) {
    return <CircularProgress />;
  }
  
  // [10. 수정] renderPresetForm: AR 카메라 제거
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
            <ListItem 
              key={hint.id} 
              divider={index < hints.length - 1}
              // [11. 추가] 삭제 버튼 (퍼즐 참고)
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => handleDeleteHint(hint.id)}
                  disabled={deleteHintMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              }
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
      
      <Divider sx={{ my: 4 }} />
      
      {/* [12. 수정] FormProvider로 폼 전체를 감쌈 */}
      <FormProvider {...methods}>
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
            {/* [13. 수정] <form> 중첩 방지 (Hydration Error) */}
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
      </FormProvider>
    </Box>
  );
}