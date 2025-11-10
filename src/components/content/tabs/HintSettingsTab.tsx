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
  arCamera: { imageUrl: string };
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
    arCamera: { imageUrl: '' },
  };

  // [오류 1 수정] 'let' -> 'const'로 변경. (내부 속성은 여전히 수정 가능)
  const formData: FullHintFormData = {
    ...defaultData,
    preset: preset as FullHintFormData['preset'],
    nfc_id: nfc?.id || null,
    reward_coin: reward_coin || 0,
  };

  try {
    switch (preset) {
      case 'cardSwipe':
        // text_block_1: "제목1|내용1", text_block_2: "제목2|내용2"
        const texts = [text_block_1, text_block_2, text_block_3].filter(Boolean) as string[];
        const cards = texts.map((text, index) => {
          const [title, cardText = ''] = text.split('|');
          // order_no: 11, 12, 13 (카드1) / 21, 22 (카드2)
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
      case 'arCamera':
        formData.arCamera.imageUrl = images[0]?.url || '';
        break;
      default:
         // cardSwipe로 강제
         formData.preset = 'cardSwipe';
    }
  } catch (e) {
    console.error("Hint to form data conversion failed. Falling back to default.", e, hint);
    // 에러 발생 시 기본값으로 복귀 (데이터가 꼬이는 것을 방지)
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
  
  // [3.1 수정 중인 힌트 state]
  const [editingHint, setEditingHint] = useState<Hint | null>(null);

  const queryClient = useQueryClient();
  const createHintMutation = useCreateHint(stageId);
  const updateHintMutation = useUpdateHint(); // [3.2 수정 mutation 훅]
  const deleteHintMutation = useDeleteHint(); 

  const { data: nfcData, isLoading: isLoadingNfcTags } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    queryFn: () => getAdminNfcTags(),
  });

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
    arCamera: { imageUrl: '' },
  };

  const methods = useForm<FullHintFormData>({
    defaultValues: defaultFormValues,
  });

  const { control, handleSubmit, watch, reset } = methods;
  const selectedPreset = watch('preset');

  // [4.1 수정 시작 핸들러]
  const handleStartEdit = (hint: Hint) => {
    const formData = convertHintToFormData(hint);
    setEditingHint(hint);
    reset(formData); // 폼 데이터를 수정할 힌트의 데이터로 리셋
  };

  // [4.2 수정 취소 핸들러]
  const handleCancelEdit = () => {
    setEditingHint(null);
    reset(defaultFormValues); // 폼을 기본값(빈 폼)으로 리셋
  };


  // [5. onSubmit 로직 수정: 생성/수정 분기]
  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let images: { url: string; alt_text?: string; order_no: number }[] = [];
    let cooldown_sec = 0; 

    switch (data.preset) {
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
      case 'arCamera':
        text_blocks = [];
        if (data.arCamera.imageUrl) {
          images = [{ url: data.arCamera.imageUrl, alt_text: 'AR Image', order_no: 1 }];
        }
        break;
    }

    // 공통 페이로드 (생성/수정 겸용)
    // [오류 2 수정] 'commonPayload'의 명시적 타입(Omit<...>) 제거
    // data.preset이 string | undefined가 아닌 string임을 TS가 추론하도록 함
    const commonPayload = {
      preset: data.preset,
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.nfc_id || null, 
      text_blocks: text_blocks.filter(t => t && t !== '|'), 
      images: images.filter(img => img.url), 
      cooldown_sec: cooldown_sec,
    };
    
    if (editingHint) {
      // --- 수정 모드 ---
      updateHintMutation.mutate({
        hintId: editingHint.id,
        stageId: stageId!,
        payload: commonPayload // HintUpdatePayload로 추론됨
      }, {
        onSuccess: () => {
          handleCancelEdit(); // 폼 리셋 및 모달 닫기
          queryClient.invalidateQueries({ queryKey: ['adminStageById', stageId] });
        },
        onError: (err) => {
          alert(`힌트 수정 실패: ${err.message}`);
        }
      });

    } else {
      // --- 생성 모드 ---
      const createPayload: HintCreatePayload = {
        ...commonPayload, // 'preset'이 string으로 추론되어 타입 오류 해결
        order_no: (hints?.length || 0) + 1, 
      };
      
      createHintMutation.mutate(createPayload, {
        onSuccess: () => {
          alert('새로운 힌트가 추가되었습니다.');
          handleCancelEdit(); // 생성 후 폼 리셋
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
  // '새 힌트 추가' 폼과 '힌트 수정' 모달이 동일한 폼을 사용하도록 추출
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

        <Controller 
          name="reward_coin" 
          control={control} 
          render={({ field }) => (
            <TextField 
              {...field} 
              type="number" 
              label="클리어 보상 (코인)" 
              value={field.value || ''} // 0 대신 ''를 표시
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
                // [7. 수정 버튼 추가]
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
                primary={`${hint.order_no}: ${hint.text_block_1 || hint.preset || '(내용 없음)'}`} // [수정] 내용 없으면 프리셋 이름 표시
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
      {/* [8. 수정 모드가 아닐 때만 '새 힌트 추가' 폼을 보여줌] */}
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
      {/* [9. 수정 모드일 때 '힌트 수정' 모달을 띄움] */}
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