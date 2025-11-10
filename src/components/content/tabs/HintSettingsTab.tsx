'use client';

// [1.1 Import 추가]
import { useState } from 'react'; 
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  FormLabel, 
  FormControl, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormHelperText, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Divider,
  Dialog, // [1.5 모달 UI를 위해 Dialog 관련 임포트]
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { useDeleteHint } from '@/hooks/mutation/useDeleteHint'; 
// [1.2 Import 추가]
import { useUpdateHint } from '@/hooks/mutation/useUpdateHint'; 
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material'; // [1.3 Import 추가]
import { 
  HintCreatePayload, 
  HintUpdatePayload, // [1.4 Import 추가]
  Hint,
  PaginatedResponse, 
  NfcTag, 
  getAdminNfcTags 
} from '@/lib/api/admin';

import CardSwipeForm from './hint-presets/CardSwipeForm';
import TopImageForm from './hint-presets/TopImageForm';
import MiddleImageForm from './hint-presets/MiddleImageForm';
import TimeAttackForm from './hint-presets/TimeAttackForm';
import ArCameraForm from './hint-presets/ArCameraForm';

interface HintSettingsTabProps {
  stageId?: string;
  hints: Hint[]; 
}

// [수정 1. FullHintFormData 타입 수정]
export type FullHintFormData = {
  preset: 'cardSwipe' | 'topImage' | 'middleImage' | 'timeAttack' | 'arCamera';
  nfc_id: string | null;
  reward_coin: number | string;
  cardSwipe: { 
    cards: { 
      title: string; 
      text: string;
      images: { url: string }[];
    }[];
  };
  topImage: { imageUrl: string; textBlocks: { text: string }[] };
  middleImage: { topText: string; mediaUrl: string; bottomText: string };
  timeAttack: { timeLimit: string; bottomText: string };
  // [수정 1.1] arCamera에서 answerStyle과 bonusCoin 제거
  arCamera: { 
    imageUrl: string;
    answer: string;
  };
};

// [2. 헬퍼 함수 추가: API 응답(Hint) -> 폼 데이터(FullHintFormData)]
// (컴포넌트 외부에 배치)
function convertHintToFormData(hint: Hint): FullHintFormData {
  const { preset, nfc, reward_coin, text_block_1, text_block_2, text_block_3, images, cooldown_sec } = hint;

  // 폼의 기본 구조
  const defaultData: FullHintFormData = {
    preset: 'cardSwipe', nfc_id: '', reward_coin: '',
    cardSwipe: { cards: [{ title: '', text: '', images: [] }] },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
    timeAttack: { timeLimit: '', bottomText: '' },
    // [수정 1.2] 헬퍼 함수의 arCamera 기본값도 맞춤
    arCamera: { 
      imageUrl: '',
      answer: '',
    },
  };

  const formData: FullHintFormData = {
    ...defaultData,
    preset: preset as FullHintFormData['preset'],
    nfc_id: nfc?.id || null,
    reward_coin: reward_coin || 0,
  };

  try {
    switch (preset) {
      // (cardSwipe, topImage, middleImage, timeAttack 케이스는 기존과 동일)
      case 'cardSwipe':
        const texts = [text_block_1, text_block_2, text_block_3].filter(Boolean) as string[];
        const cards = texts.map((text, index) => {
          const [title, cardText = ''] = text.split('|');
          const cardImages = images
            .filter(img => Math.floor(img.order_no / 10) === (index + 1))
            .sort((a, b) => a.order_no - b.order_no)
            .map(img => ({ url: img.url }));
          return { title: title || '', text: cardText, images: cardImages };
        });
        formData.cardSwipe.cards = cards.length > 0 ? cards : [{ title: '', text: '', images: [] }];
        break;
      case 'topImage':
        formData.topImage.imageUrl = images[0]?.url || '';
        const textBlocks = [text_block_1, text_block_2, text_block_3]
          .filter(t => t !== null && t !== undefined)
          .map(text => ({ text: text || '' }));
        formData.topImage.textBlocks = textBlocks.length > 0 ? textBlocks : [{ text: '' }];
        break;
      case 'middleImage':
        formData.middleImage.topText = text_block_1 || '';
        formData.middleImage.mediaUrl = images[0]?.url || '';
        formData.middleImage.bottomText = text_block_2 || '';
        break;
      case 'timeAttack':
        formData.timeAttack.timeLimit = String(cooldown_sec || 0);
        formData.timeAttack.bottomText = text_block_1 || '';
        break;

      // [수정 4. convertHintToFormData 로직 수정]
      case 'arCamera':
        formData.arCamera.imageUrl = images[0]?.url || '';
        // text_block_1에서 정답 데이터 파싱
        formData.arCamera.answer = text_block_1 || '';
        break;
      default:
         formData.preset = 'cardSwipe';
    }
  } catch (e) {
    console.error("Hint to form data conversion failed. Falling back to default.", e, hint);
    return {
      ...defaultData,
      preset: 'cardSwipe',
      nfc_id: nfc?.id || null,
      reward_coin: reward_coin || 0,
    };
  }

  return formData;
}


export default function HintSettingsTab({ stageId, hints }: HintSettingsTabProps) {
  
  const [editingHint, setEditingHint] = useState<Hint | null>(null);

  const queryClient = useQueryClient();
  const createHintMutation = useCreateHint(stageId);
  const updateHintMutation = useUpdateHint();
  const deleteHintMutation = useDeleteHint(); 

  const { data: nfcData, isLoading: isLoadingNfcTags } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    queryFn: () => getAdminNfcTags(),
  });

  // [수정 2. defaultValues 수정]
  const defaultFormValues: FullHintFormData = {
    preset: 'cardSwipe',
    nfc_id: '',
    reward_coin: '',
    cardSwipe: { 
      cards: [{ title: '', text: '', images: [] }] 
    },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
    timeAttack: { timeLimit: '', bottomText: '' },
    // [수정 2.1] arCamera 기본값 축소
    arCamera: { 
      imageUrl: '',
      answer: '',
    },
  };

  const methods = useForm<FullHintFormData>({
    defaultValues: defaultFormValues,
  });

  const { control, handleSubmit, watch, reset } = methods;
  const selectedPreset = watch('preset');

  const handleStartEdit = (hint: Hint) => {
    const formData = convertHintToFormData(hint);
    setEditingHint(hint);
    reset(formData); 
  };

  const handleCancelEdit = () => {
    setEditingHint(null);
    reset(defaultFormValues); 
  };


  // [수정 3. onSubmit 로직 수정]
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let images: { url: string; alt_text?: string; order_no: number }[] = [];
    let cooldown_sec = 0; 

    switch (data.preset) {
      // (cardSwipe, topImage, middleImage, timeAttack 케이스는 기존과 동일)
      case 'cardSwipe':
        text_blocks = data.cardSwipe.cards.map(card => `${card.title || ''}|${card.text || ''}`);
        images = data.cardSwipe.cards.flatMap((card, cardIndex) => 
          (card.images || []).map((img, imgIndex) => ({
            url: img.url,
            alt_text: `Card ${cardIndex + 1} Image ${imgIndex + 1}`,
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

      // [수정 3.1] arCamera 케이스 로직 변경
      case 'arCamera':
        // 정답 데이터만 text_block_1에 저장
        text_blocks = [
          data.arCamera.answer,
        ];
        if (data.arCamera.imageUrl) {
          images = [{ url: data.arCamera.imageUrl, alt_text: 'AR Image', order_no: 1 }];
        }
        break;
    }

    const commonPayload = {
      preset: data.preset,
      reward_coin: Number(data.reward_coin) || 0,
      // [수정 3.2] arCamera 프리셋일 경우, nfc_id를 강제로 null로 설정
      nfc_id: data.preset === 'arCamera' ? null : (data.nfc_id || null), 
      text_blocks: text_blocks.filter(t => t && t !== '|'), 
      images: images.filter(img => img.url), 
      cooldown_sec: cooldown_sec,
    };
    
    if (editingHint) {
      // --- 수정 모드 ---
      updateHintMutation.mutate({
        hintId: editingHint.id,
        stageId: stageId!,
        payload: commonPayload
      }, {
        onSuccess: () => {
          handleCancelEdit(); 
          queryClient.invalidateQueries({ queryKey: ['adminStageById', stageId] });
        },
        onError: (err) => {
          alert(`힌트 수정 실패: ${err.message}`);
        }
      });

    } else {
      // --- 생성 모드 ---
      const createPayload: HintCreatePayload = {
        ...commonPayload, 
        order_no: (hints?.length || 0) + 1, 
      };
      
      createHintMutation.mutate(createPayload, {
        onSuccess: () => {
          alert('새로운 힌트가 추가되었습니다.');
          handleCancelEdit(); 
          queryClient.invalidateQueries({ queryKey: ['adminStageById', stageId] });
        },
        onError: (err) => {
          alert(`힌트 추가 실패: ${err.message}`);
        }
      });
    }
  };

  const handleDeleteHint = (hintId: string) => {
    if (confirm('이 힌트를 정말 삭제하시겠습니까?')) {
      deleteHintMutation.mutate({ hintId, stageId });
    }
  };

  if (isLoadingNfcTags) {
    return <CircularProgress />;
  }
  
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
        return <Typography color="error">알 수 없는 프리셋입니다: {selectedPreset}</Typography>;
    }
  }

  // [6. 폼 렌더링 로직 (공통)]
  const renderHintForm = () => (
    <FormProvider {...methods}>
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
        
        {/* [수정 5. NFC 선택 UI 조건부 렌더링] */}
        {selectedPreset !== 'arCamera' && (
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
        )}

        <Controller 
          name="reward_coin" 
          control={control} 
          render={({ field }) => (
            <TextField 
              {...field} 
              type="number" 
              label="클리어 보상 (코인)" 
              value={field.value || ''}
            />
          )} 
        />
      </Box>
    </FormProvider>
  );

  const isMutating = createHintMutation.isPending || updateHintMutation.isPending;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>힌트 목록</Typography>
      <List dense sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
        {hints && hints.length > 0 ? (
          hints.map((hint, index) => (
            <ListItem 
              key={hint.id} 
              divider={index < hints.length - 1}
              secondaryAction={
                <Box>
                  <IconButton 
                    edge="end" 
                    aria-label="edit" 
                    onClick={() => handleStartEdit(hint)}
                    disabled={isMutating}
                    sx={{ mr: 0.5 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteHint(hint.id)}
                    disabled={deleteHintMutation.isPending || isMutating}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText 
                primary={`${hint.order_no}: ${hint.text_block_1 || hint.preset || '(내용 없음)'}`} 
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
      
      {/* --- 힌트 생성 폼 --- */}
      {!editingHint && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>새 힌트 추가</Typography>
          {renderHintForm()}
          <Box sx={{ mt: 3 }}>
            <Button 
              type="button" 
              variant="contained" 
              onClick={handleSubmit(onSubmit)}
              disabled={isMutating}
            >
              {isMutating ? '추가 중...' : '힌트 추가'}
            </Button>
          </Box>
        </Box>
      )}

      {/* --- 힌트 수정 모달 --- */}
      <Dialog 
        open={!!editingHint} 
        onClose={handleCancelEdit} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          힌트 수정
          <IconButton
            aria-label="close"
            onClick={handleCancelEdit}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important' }}>
          {isMutating && <LinearProgress sx={{ mb: 2 }} />}
          {renderHintForm()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelEdit} disabled={isMutating}>
            취소
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(onSubmit)} 
            disabled={isMutating}
          >
            {isMutating ? '수정 중...' : '수정 완료'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}