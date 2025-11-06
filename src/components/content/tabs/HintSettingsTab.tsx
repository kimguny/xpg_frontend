'use client';

// [1. FormProvider, useForm, useQueryClient 추가]
import { Box, Button, TextField, Typography, IconButton, FormLabel, FormControl, CircularProgress, List, ListItem, ListItemText, Select, MenuItem, InputLabel, FormHelperText, RadioGroup, FormControlLabel, Radio, Divider } from '@mui/material';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { useDeleteHint } from '@/hooks/mutation/useDeleteHint';
import { Delete as DeleteIcon } from '@mui/icons-material';
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

// [2. FullHintFormData 타입: "카드1 > 이미지3" 구조로 수정]
export type FullHintFormData = {
  preset: 'cardSwipe' | 'topImage' | 'middleImage' | 'timeAttack';
  nfc_id: string | null;
  reward_coin: number | string;
  cardSwipe: { 
    cards: { 
      title: string; 
      text: string;
      images: { url: string }[]; // 각 카드 내부에 이미지 배열
    }[];
  };
  topImage: { imageUrl: string; textBlocks: { text: string }[] };
  middleImage: { topText: string; mediaUrl: string; bottomText: string };
  timeAttack: { timeLimit: string; bottomText: string };
};

export default function HintSettingsTab({ stageId, hints }: HintSettingsTabProps) {
  
  const queryClient = useQueryClient();
  const createHintMutation = useCreateHint(stageId);
  const deleteHintMutation = useDeleteHint(); 

  const { data: nfcData, isLoading: isLoadingNfcTags } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    queryFn: () => getAdminNfcTags(),
  });

  // [3. useForm을 methods로 정의 (ts(2739) 오류 해결)]
  const methods = useForm<FullHintFormData>({
    defaultValues: {
      preset: 'cardSwipe',
      nfc_id: '',
      reward_coin: '',
      cardSwipe: { 
        cards: [{ title: '', text: '', images: [] }] // images 기본값 추가
      },
      topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
      middleImage: { topText: '', mediaUrl: '', bottomText: '' },
      timeAttack: { timeLimit: '', bottomText: '' },
    },
  });

  // methods에서 필요한 함수들을 구조 분해
  const { control, handleSubmit, watch, reset } = methods;
  const selectedPreset = watch('preset');

  // [4. onSubmit 로직: payload.images를 cardSwipe의 중첩 배열에서 추출]
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let images: { url: string; alt_text?: string; order_no: number }[] = [];
    let cooldown_sec = 0; 

    switch (data.preset) {
      case 'cardSwipe':
        text_blocks = data.cardSwipe.cards.map(card => `${card.title || ''}|${card.text || ''}`);
        // 각 카드의 이미지 배열을 순회하며 고유한 order_no 부여
        images = data.cardSwipe.cards.flatMap((card, cardIndex) => 
          (card.images || []).map((img, imgIndex) => ({
            url: img.url,
            alt_text: `Card ${cardIndex + 1} Image ${imgIndex + 1}`,
            // 예: 카드1의 2번째 이미지는 12, 카드2의 1번째 이미지는 21
            order_no: (cardIndex + 1) * 10 + (imgIndex + 1), 
          }))
        );
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
      images: images.filter(img => img.url), 
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

  // [5. 힌트 삭제 핸들러]
  const handleDeleteHint = (hintId: string) => {
    if (confirm('이 힌트를 정말 삭제하시겠습니까?')) {
      deleteHintMutation.mutate({ hintId, stageId });
    }
  };

  if (isLoadingNfcTags) {
    return <CircularProgress />;
  }
  
  // [6. renderPresetForm: AR 카메라 제거]
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
              // [7. 삭제 버튼 추가]
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
      
      {/* [8. FormProvider로 폼 전체를 감쌈] */}
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
            {/* [9. <form> 중첩 방지 (Hydration Error)] */}
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