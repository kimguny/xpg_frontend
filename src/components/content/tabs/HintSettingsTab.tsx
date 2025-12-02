'use client';

import { useState } from 'react'; 
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  FormLabel, 
  FormControl, 
  List, 
  ListItem, 
  ListItemText, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query'; 
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { useDeleteHint } from '@/hooks/mutation/useDeleteHint'; 
import { useUpdateHint } from '@/hooks/mutation/useUpdateHint'; 
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { 
  HintCreatePayload, 
  Hint,
  NfcTag, 
} from '@/lib/api/admin';
import { useGetNfcTags } from '@/hooks/query/useGetNfcTags';
import { useDebounce } from '@/hooks/useDebounce';

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
  nfc_option: NfcTag | null; 
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
  // [수정 1] retryCooldown 필드 추가
  timeAttack: { 
    timeLimit: string; 
    bottomText: string; 
    retryCooldown: string; 
  };
  arCamera: { 
    imageUrl: string;
    answer: string;
  };
};

function convertHintToFormData(hint: Hint): FullHintFormData {
  const { preset, nfc, reward_coin, text_block_1, text_block_2, text_block_3, images, cooldown_sec } = hint;

  const defaultData: FullHintFormData = {
    preset: 'cardSwipe', 
    nfc_option: null,
    reward_coin: '',
    cardSwipe: { cards: [{ title: '', text: '', images: [] }] },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
    // [수정 2] 기본값 설정
    timeAttack: { timeLimit: '', bottomText: '', retryCooldown: '' },
    arCamera: { imageUrl: '', answer: '' },
  };

  const formData: FullHintFormData = {
    ...defaultData,
    preset: preset as FullHintFormData['preset'],
    nfc_option: hint.nfc ? (hint.nfc as NfcTag) : null,
    reward_coin: reward_coin || 0,
  };

  try {
    switch (preset) {
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
        // [수정 3] 데이터 매핑 (text_block_2를 재시도 쿨타임으로 사용)
        formData.timeAttack.timeLimit = String(cooldown_sec || 0);
        formData.timeAttack.bottomText = text_block_1 || '';
        formData.timeAttack.retryCooldown = text_block_2 || ''; 
        break;
      case 'arCamera':
        formData.arCamera.imageUrl = images[0]?.url || '';
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
      nfc_option: hint.nfc ? (hint.nfc as NfcTag) : null, 
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

  const [nfcSearchInput, setNfcSearchInput] = useState('');
  const debouncedNfcSearch = useDebounce(nfcSearchInput, 300);

  const { data: nfcData, isLoading: isLoadingNfcTags } = useGetNfcTags({
    search: debouncedNfcSearch,
    page: 1,
    size: 20,
  });
  const nfcOptions = nfcData?.items || [];

  const defaultFormValues: FullHintFormData = {
    preset: 'cardSwipe',
    nfc_option: null, 
    reward_coin: '',
    cardSwipe: { cards: [{ title: '', text: '', images: [] }] },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
    // [수정 4] 기본값 추가
    timeAttack: { timeLimit: '', bottomText: '', retryCooldown: '' },
    arCamera: { imageUrl: '', answer: '' },
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
    if (formData.nfc_option) {
      setNfcSearchInput(formData.nfc_option.tag_name);
    } else {
      setNfcSearchInput('');
    }
  };

  const handleCancelEdit = () => {
    setEditingHint(null);
    reset(defaultFormValues); 
    setNfcSearchInput(''); 
  };

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
        // [수정 5] 데이터 저장 (text_block_2에 재시도 쿨타임 저장)
        text_blocks = [data.timeAttack.bottomText, data.timeAttack.retryCooldown];
        cooldown_sec = Number(data.timeAttack.timeLimit) || 0;
        break;
      case 'arCamera':
        text_blocks = [data.arCamera.answer];
        if (data.arCamera.imageUrl) {
          images = [{ url: data.arCamera.imageUrl, alt_text: 'AR Image', order_no: 1 }];
        }
        break;
    }

    const commonPayload = {
      preset: data.preset,
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.preset === 'arCamera' ? null : (data.nfc_option?.id || null), 
      text_blocks: text_blocks.filter(t => t && t !== '|'), 
      images: images.filter(img => img.url), 
      cooldown_sec: cooldown_sec,
    };
    
    if (editingHint) {
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
        
        {selectedPreset !== 'arCamera' && (
          <Controller
            name="nfc_option" 
            control={control}
            render={({ field }) => (
              <Autocomplete
                fullWidth
                sx={{ mb: 2 }}
                value={field.value}
                onChange={(event, newValue: NfcTag | null) => {
                  field.onChange(newValue);
                }}
                inputValue={nfcSearchInput}
                onInputChange={(event, newInputValue) => {
                  setNfcSearchInput(newInputValue);
                }}
                options={nfcOptions}
                getOptionLabel={(option) => 
                  `${option.tag_name} (ID: ${option.id.substring(0, 8)}...)`
                }
                isOptionEqualToValue={(option, value) => 
                  option.id === value.id
                }
                loading={isLoadingNfcTags}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="연계 NFC (검색)"
                    placeholder="태그명 또는 UDID로 검색..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingNfcTags ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...liProps } = props;
                  return (
                    <Box component="li" key={key} {...liProps}>
                      <Typography variant="body2">{option.tag_name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (UDID: ...{option.udid.slice(-6)})
                      </Typography>
                    </Box>
                  );
                }}
              />
            )}
          />
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