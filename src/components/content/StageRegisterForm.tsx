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

// react-hook-form에서 사용할 폼 데이터 타입
// API Payload와 최대한 유사하게 정의하되, UI 편의를 위한 필드 추가
type StageFormData = Omit<StageCreatePayload, 'location'> & {
  latitude?: number | string;
  longitude?: number | string;
  radius_m?: number | string;
  // UI 전용 필드들
  unlockCondition: 'open' | 'location' | 'stage';
};

export default function StageRegisterForm({ contentId, stageId, stageNo }: StageRegisterFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const isEditMode = !!stageId;
  
  const { data: existingStage, isLoading: isLoadingStage } = useGetStageById(stageId);
  const displayStageNo = isEditMode ? existingStage?.stage_no : stageNo;

  const createMutation = useCreateStage(contentId);
  const updateMutation = useUpdateStage(contentId, stageId!);

  const { control, handleSubmit, reset, setValue, watch } = useForm<StageFormData>({
    defaultValues: {
      stage_no: stageNo,
      title: '',
      description: '',
      start_button_text: '탐험 시작하기',
      is_hidden: false,
      unlockCondition: 'open',
      latitude: '',
      longitude: '',
      radius_m: '',
      time_limit_min: null,
      clear_need_nfc_count: null,
      clear_time_attack_sec: null,
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
      };
      reset(formData);
    }
  }, [existingStage, reset]);

  const onSubmit: SubmitHandler<StageFormData> = (data) => {
    // 폼 데이터를 실제 API 페이로드로 변환
    const payload: StageCreatePayload = {
      ...data,
      time_limit_min: data.time_limit_min ? Number(data.time_limit_min) : null,
      clear_need_nfc_count: data.clear_need_nfc_count ? Number(data.clear_need_nfc_count) : null,
      clear_time_attack_sec: data.clear_time_attack_sec ? Number(data.clear_time_attack_sec) : null,
      location: data.latitude && data.longitude ? {
        lat: Number(data.latitude),
        lon: Number(data.longitude),
        radius_m: data.radius_m ? Number(data.radius_m) : null,
      } : null,
    };

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
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: '타이틀은 필수입니다.' }}
                  render={({ field, fieldState }) => (
                    <TextField {...field} label="스테이지 타이틀" fullWidth sx={{ mb: 3 }} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="설명" fullWidth multiline rows={4} sx={{ mb: 3 }} />
                  )}
                />
                
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>위치 설정</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Controller name="latitude" control={control} render={({ field }) => <TextField {...field} label="위도" fullWidth />} />
                  <Controller name="longitude" control={control} render={({ field }) => <TextField {...field} label="경도" fullWidth />} />
                  <Button variant="contained" onClick={() => setIsMapOpen(true)} sx={{ minWidth: 120 }}>지도에서 입력</Button>
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>스테이지 해금 조건</Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <Controller
                    name="unlockCondition"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} row>
                        <FormControlLabel value="open" control={<Radio />} label="오픈" />
                        <FormControlLabel value="location" control={<Radio />} label="위치 반경" />
                        <FormControlLabel value="stage" control={<Radio />} label="스테이지 완료" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
                {unlockCondition === 'location' && (
                  <Controller
                    name="radius_m"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} type="number" label="반경 (m)" sx={{ width: 200 }} />
                    )}
                  />
                )}
                {/* '스테이지 완료' 조건 UI는 추후 구현 */}
              </Box>
            )}

            {activeTab === 1 && <HintSettingsTab stageId={stageId} />}
            {activeTab === 2 && <PuzzleSettingsTab />}
            {activeTab === 3 && <UnlockSettingsTab />}
            
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