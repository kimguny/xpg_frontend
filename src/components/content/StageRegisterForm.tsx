'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { useCreateStage } from '@/hooks/mutation/useCreateStage';
import { useUpdateStage } from '@/hooks/mutation/useUpdateStage';
import { useGetStageById } from '@/hooks/query/useGetStageById';
import { StageCreatePayload } from '@/lib/api/admin';

import HintSettingsTab from './tabs/HintSettingsTab';
import PuzzleSettingsTab from './tabs/PuzzleSettingsTab';
import UnlockSettingsTab from './tabs/UnlockSettingsTab';
import MapDialog from '@/components/common/MapDialog';

interface StageRegisterFormProps {
  contentId: string;
  stageId?: string;
  stageNo?: string;
}

type StageFormData = Omit<StageCreatePayload, 'location' | 'time_limit_min' | 'clear_need_nfc_count' | 'clear_time_attack_sec'> & {
  latitude?: number | string;
  longitude?: number | string;
  radius_m?: number | string;
  unlockCondition: 'open' | 'location' | 'stage';
  time_limit_min?: number | string | null;
  clear_need_nfc_count?: number | string | null;
  clear_time_attack_sec?: number | string | null;
};

export default function StageRegisterForm({ contentId, stageId, stageNo }: StageRegisterFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const isEditMode = !!stageId;
  
  const { data: existingStage, isLoading: isLoadingStage } = useGetStageById(stageId);
  const createMutation = useCreateStage(contentId);
  const updateMutation = useUpdateStage(contentId, stageId!);

  const { control, handleSubmit, reset, setValue, watch } = useForm<StageFormData>({
    defaultValues: {
      stage_no: stageNo,
      title: '',
      description: '',
      start_button_text: '',
      is_hidden: false,
      unlockCondition: 'open',
      unlock_on_enter_radius: false,
      unlock_stage_id: null,
      latitude: '',
      longitude: '',
      radius_m: '',
      // ✨ 1. null 대신 빈 문자열('')로 초기값을 설정합니다.
      time_limit_min: '',
      clear_need_nfc_count: '',
      clear_time_attack_sec: '',
      background_image_url: '',
      thumbnail_url: '',
    },
  });

  const unlockCondition = watch('unlockCondition');

  useEffect(() => {
    if (existingStage) {
      const formData: Partial<StageFormData> = {
        ...existingStage,
        latitude: existingStage.location?.lat ?? '',
        longitude: existingStage.location?.lon ?? '',
        radius_m: existingStage.location?.radius_m ?? '', 
        unlockCondition: existingStage.unlock_stage_id ? 'stage' : (existingStage.location ? 'location' : 'open'),
        // ✨ 2. API로부터 받은 null 값을 빈 문자열('')로 변환합니다.
        time_limit_min: existingStage.time_limit_min ?? '',
        clear_need_nfc_count: existingStage.clear_need_nfc_count ?? '',
        clear_time_attack_sec: existingStage.clear_time_attack_sec ?? '',
      };
      reset(formData);
    }
  }, [existingStage, reset]);

const onSubmit: SubmitHandler<StageFormData> = (data) => {
    // (data 분리 로직은 동일)
    const {
      latitude,
      longitude,
      radius_m,
      unlockCondition,
      ...restOfData 
    } = data;

    // (숫자 변환 로직은 동일)
    const timeLimit = Number(data.time_limit_min);
    const finalTimeLimit = timeLimit >= 1 ? timeLimit : null;
    const timeAttack = Number(data.clear_time_attack_sec);
    const finalTimeAttack = timeAttack >= 1 ? timeAttack : null;
    const nfcCount = Number(data.clear_need_nfc_count);
    const finalNfcCount = nfcCount >= 0 ? nfcCount : null;

    // 4. 백엔드(StageCreate) 스키마와 정확히 일치하는 payload를 생성합니다.
    const payload: StageCreatePayload = {
      ...restOfData, 
      stage_no: data.stage_no,
      
      time_limit_min: finalTimeLimit,
      clear_time_attack_sec: finalTimeAttack,
      
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
      // [수정] 생성(isEditMode=false) 시에는 DB 트리거 오류 방지를 위해 null을 전송합니다.
      clear_need_nfc_count: isEditMode ? finalNfcCount : null,
      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

      location: latitude && longitude ? {
        lat: Number(latitude),
        lon: Number(longitude),
        radius_m: radius_m ? Number(radius_m) : null,
      } : null,
      
      unlock_stage_id: unlockCondition === 'stage' ? data.unlock_stage_id : null,
      unlock_on_enter_radius: unlockCondition === 'location',
    };
    
    // (디버깅용 console.log는 이제 삭제하셔도 됩니다)
    // console.log("[DEBUG] API Payload:", JSON.stringify(payload, null, 2));

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };
  
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat);
    setValue('longitude', location.lng);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const displayStageNo = isEditMode ? existingStage?.stage_no : stageNo;

  if (isEditMode && isLoadingStage) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            스테이지 {isEditMode ? '수정' : '등록'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            스테이지 No: {displayStageNo}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => router.push(`/save/content/stage/${contentId}`)}
        >
          스테이지 관리로 돌아가기
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="기본 정보" />
        <Tab label="힌트 설정" disabled={!isEditMode} />
        <Tab label="퍼즐 설정" disabled={!isEditMode} />
        <Tab label="해금 설정" disabled={!isEditMode} />
      </Tabs>

      <Card sx={{ boxShadow: 1 }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 0 && (
              <Box>
                <Controller name="title" control={control} rules={{ required: '타이틀은 필수입니다.' }} render={({ field, fieldState }) => (<TextField {...field} label="스테이지 타이틀" fullWidth sx={{ mb: 3 }} error={!!fieldState.error} helperText={fieldState.error?.message} />)} />
                <Controller name="description" control={control} render={({ field }) => (<TextField {...field} label="설명" fullWidth multiline rows={4} sx={{ mb: 3 }} />)} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>위치 설정</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Controller name="latitude" control={control} render={({ field }) => <TextField {...field} label="위도" fullWidth />} />
                  <Controller name="longitude" control={control} render={({ field }) => <TextField {...field} label="경도" fullWidth />} />
                  <Button variant="contained" onClick={() => setIsMapOpen(true)} sx={{ minWidth: 120 }}>지도에서 입력</Button>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>스테이지 해금 조건</Typography>
                <Box sx={{ mb: 3 }}>
                  <FormControl component="fieldset">
                    <Controller name="unlockCondition" control={control} render={({ field }) => (
                        <RadioGroup {...field} row>
                          <FormControlLabel value="open" control={<Radio />} label="오픈" />
                          <FormControlLabel value="location" control={<Radio />} label="위치 반경" />
                          <FormControlLabel value="stage" control={<Radio />} label="스테이지 완료" />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                  {unlockCondition === 'location' && (
                    <Controller name="radius_m" control={control} render={({ field }) => (<TextField {...field} type="number" label="반경 (m)" sx={{ width: 200, mt: 1 }} />)} />
                  )}
                  {unlockCondition === 'stage' && (
                    <Controller name="unlock_stage_id" control={control} render={({ field }) => (<TextField {...field} label="완료해야 할 스테이지 ID" sx={{ width: 300, mt: 1 }} />)} />
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>스테이지 제한 시간</Typography>
                <Controller name="time_limit_min" control={control} render={({ field }) => (<TextField {...field} type="number" label="제한 시간 (분)" placeholder="없음" sx={{ width: 200, mb: 3 }} />)} />
                
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>스테이지 클리어 조건</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                  <Controller name="clear_time_attack_sec" control={control} render={({ field }) => (<TextField {...field} type="number" label="타임어택 (초)" sx={{ width: 150 }} />)} />
                  <Controller name="clear_need_nfc_count" control={control} render={({ field }) => (<TextField {...field} type="number" label="필요 NFC 태그 수" sx={{ width: 150 }} />)} />
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>히든 스테이지 설정</Typography>
                <FormControl component="fieldset" sx={{ mb: 3 }}>
                  <Controller name="is_hidden" control={control} render={({ field }) => (
                      <RadioGroup {...field} row value={(field.value ?? false).toString()} onChange={(e) => field.onChange(e.target.value === 'true')}>
                        <FormControlLabel value="false" control={<Radio />} label="일반 스테이지" />
                        <FormControlLabel value="true" control={<Radio />} label="히든 스테이지" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>시작 버튼 텍스트</Typography>
                <Controller name="start_button_text" control={control} render={({ field }) => (<TextField {...field} label="시작 버튼 텍스트" fullWidth sx={{ mb: 3 }} />)} />
                
              </Box>
            )}

            {activeTab === 1 && <HintSettingsTab stageId={stageId} hints={existingStage?.hints || []} />}
            {activeTab === 2 && <PuzzleSettingsTab stageId={stageId} />}
            {activeTab === 3 && <UnlockSettingsTab stageId={stageId}/>}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 3, mt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button variant="outlined">미리보기</Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? '저장 중...' : (isEditMode ? '수정하기' : '저장하기')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}