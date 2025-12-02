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
  CircularProgress,
  Stack,           // [추가] UI 레이아웃용
  InputAdornment   // [추가] 입력 필드 단위 표시용
} from '@mui/material';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query'; 
import { useCreateHint } from '@/hooks/mutation/useCreateHint';
import { useDeleteHint } from '@/hooks/mutation/useDeleteHint'; 
import { useUpdateHint } from '@/hooks/mutation/useUpdateHint'; 
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Map as MapIcon } from '@mui/icons-material';
import { 
  HintCreatePayload,
  HintUpdatePayload, // [추가] 타입 안전성을 위해 import 
  Hint,
  NfcTag, 
} from '@/lib/api/admin';
import { useGetNfcTags } from '@/hooks/query/useGetNfcTags';
import { useDebounce } from '@/hooks/useDebounce';

// [추가] MapDialog import
import MapDialog from '@/components/common/MapDialog';

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
  
  // [추가] 위치 정보 필드 (입력 편의를 위해 string으로 관리 후 전송 시 변환)
  use_location: boolean;
  latitude: string;
  longitude: string;
  radius_m: string;

  cardSwipe: { 
    cards: { 
      title: string; 
      text: string;
      images: { url: string }[];
    }[];
  };
  topImage: { imageUrl: string; textBlocks: { text: string }[] };
  middleImage: { topText: string; mediaUrl: string; bottomText: string };
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
  const { 
    preset, 
    nfc, 
    reward_coin, 
    text_block_1, 
    text_block_2, 
    text_block_3, 
    images, 
    cooldown_sec,
    failure_cooldown_sec,
    location, // [추가] 구조 분해
    radius_m  // [추가] 구조 분해
  } = hint;

  const defaultData: FullHintFormData = {
    preset: 'cardSwipe', 
    nfc_option: null,
    reward_coin: '',
    
    // [추가] 위치 기본값 매핑
    use_location: !!location, // location 객체가 있으면 true
    latitude: location ? String(location.lat) : '',
    longitude: location ? String(location.lon) : '',
    radius_m: radius_m ? String(radius_m) : '30', // 기본값 30m

    cardSwipe: { cards: [{ title: '', text: '', images: [] }] },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
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
        formData.timeAttack.timeLimit = String(cooldown_sec || 0);
        formData.timeAttack.bottomText = text_block_1 || '';
        formData.timeAttack.retryCooldown = String(failure_cooldown_sec || 0); 
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
  
  // [추가] 지도 다이얼로그 상태
  const [isMapOpen, setIsMapOpen] = useState(false);

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
    
    // [추가] 위치 기본값
    use_location: false,
    latitude: '',
    longitude: '',
    radius_m: '30',

    cardSwipe: { cards: [{ title: '', text: '', images: [] }] },
    topImage: { imageUrl: '', textBlocks: [{ text: '' }] },
    middleImage: { topText: '', mediaUrl: '', bottomText: '' },
    timeAttack: { timeLimit: '', bottomText: '', retryCooldown: '' },
    arCamera: { imageUrl: '', answer: '' },
  };

  const methods = useForm<FullHintFormData>({
    defaultValues: defaultFormValues,
  });

  const { control, handleSubmit, watch, setValue, reset } = methods;
  const selectedPreset = watch('preset');
  const useLocation = watch('use_location'); // 위치 사용 여부 감시

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

  // [추가] 지도에서 위치 선택 시 콜백
  const handleMapSelect = (lat: number, lng: number) => {
    setValue('latitude', String(lat));
    setValue('longitude', String(lng));
    setIsMapOpen(false);
  };

  const onSubmit: SubmitHandler<FullHintFormData> = (data) => {
    let text_blocks: string[] = [];
    let images: { url: string; alt_text?: string; order_no: number }[] = [];
    let cooldown_sec = 0; 
    let failure_cooldown_sec = 0;

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
        failure_cooldown_sec = Number(data.timeAttack.retryCooldown) || 0;
        break;
      case 'arCamera':
        text_blocks = [data.arCamera.answer];
        if (data.arCamera.imageUrl) {
          images = [{ url: data.arCamera.imageUrl, alt_text: 'AR Image', order_no: 1 }];
        }
        break;
    }

    // [추가] 위치 정보 페이로드 구성
    let location = null;
    let radius_m = null;
    if (data.use_location && data.latitude && data.longitude) {
      location = {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
      };
      radius_m = parseInt(data.radius_m) || 30;
    }

    // [수정] 타입 명시: commonPayload는 HintCreatePayload 구조를 따름 (any 사용 X)
    const commonPayload: Omit<HintCreatePayload, 'order_no'> = {
      preset: data.preset,
      reward_coin: Number(data.reward_coin) || 0,
      nfc_id: data.preset === 'arCamera' ? null : (data.nfc_option?.id || null), 
      text_blocks: text_blocks.filter(t => t && t !== '|'), 
      images: images.filter(img => img.url), 
      cooldown_sec: cooldown_sec,
      failure_cooldown_sec: failure_cooldown_sec,
      
      // 위치 정보 할당
      location: location,
      radius_m: radius_m,
    };
    
    if (editingHint) {
      // 수정 시 Payload 타입 맞춤
      const updatePayload: HintUpdatePayload = {
        ...commonPayload,
      };

      updateHintMutation.mutate({
        hintId: editingHint.id,
        stageId: stageId!,
        payload: updatePayload
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
      // 생성 시 Payload 타입 맞춤
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
      
      <Divider sx={{ my: 3 }} />

      {/* 2. 해금 조건 설정 (NFC & GPS) */}
      <Box sx={{ pt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>2. 해금 조건 (정답) 설정</Typography>
        
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
                    label="연계 NFC (선택)"
                    placeholder="태그명 또는 UDID로 검색..."
                    helperText="NFC 태그를 설정하면 태깅 시 힌트가 해금됩니다."
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

        {/* [추가] GPS 위치 설정 섹션 */}
        <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
              GPS 위치 인증
            </Typography>
            <Controller
              name="use_location"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Radio checked={field.value} onClick={() => field.onChange(!field.value)} />}
                  label="사용"
                  sx={{ m: 0 }}
                />
              )}
            />
          </Box>

          {useLocation && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="위도" size="small" fullWidth />
                  )}
                />
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="경도" size="small" fullWidth />
                  )}
                />
                <Button 
                  variant="outlined" 
                  startIcon={<MapIcon />} 
                  onClick={() => setIsMapOpen(true)}
                  sx={{ minWidth: '100px', height: '40px' }}
                >
                  지도
                </Button>
              </Stack>
              <Controller
                name="radius_m"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="인증 반경 (m)" 
                    type="number" 
                    size="small" 
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>,
                    }}
                    helperText="해당 위치 반경 내에 진입하면 정답 처리됩니다."
                  />
                )}
              />
            </Stack>
          )}
        </Box>

        <Controller 
          name="reward_coin" 
          control={control} 
          render={({ field }) => (
            <TextField 
              {...field} 
              type="number" 
              label="클리어 보상 (코인)" 
              value={field.value || ''}
              fullWidth
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
                secondary={
                  `프리셋: ${hint.preset} ` +
                  `/ NFC: ${hint.nfc ? 'O' : 'X'} ` +
                  `/ GPS: ${hint.location ? 'O' : 'X'}`
                } 
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

      {/* [추가] MapDialog 렌더링 */}
      <MapDialog 
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelect={handleMapSelect}
        initialLat={Number(methods.watch('latitude')) || 34.8118}
        initialLng={Number(methods.watch('longitude')) || 126.3920}
      />
    </Box>
  );
}