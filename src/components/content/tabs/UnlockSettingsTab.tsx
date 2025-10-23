'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, Card, CircularProgress } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useUpdateUnlock } from '@/hooks/mutation/useUpdateUnlock';
import { useGetStageById } from '@/hooks/query/useGetStageById';
import { UnlockConfigPayload } from '@/lib/api/admin';

// 프리셋 컴포넌트들을 import 합니다.
import FullscreenForm from './unlock-presets/FullscreenForm';
import PopupForm from './unlock-presets/PopupForm';

interface UnlockSettingsTabProps {
  stageId?: string;
}

type UnlockFormData = UnlockConfigPayload;

export default function UnlockSettingsTab({ stageId }: UnlockSettingsTabProps) {
  const { data: existingStage, isLoading } = useGetStageById(stageId);
  const updateUnlockMutation = useUpdateUnlock(stageId);
  
  const { control, handleSubmit, reset, watch } = useForm<UnlockFormData>({
    defaultValues: {
      preset: 'fullscreen',
      next_action: 'next_step',
      title: '',
      bottom_text: '',
      image_url: '',
    },
  });

  const selectedPreset = watch('preset');

  useEffect(() => {
    // API 명세와 DB 스키마를 다시 확인하니, unlock_config는 stage_unlocks 테이블에 별도로 저장됩니다.
    // getAdminStageById 응답에 이 정보가 포함되도록 백엔드 수정이 필요할 수 있습니다.
    // 우선, `existingStage.unlock_config`가 있다고 가정하고 진행합니다.
    if (existingStage?.unlock_config) {
      reset(existingStage.unlock_config);
    }
  }, [existingStage, reset]);

  const onSubmit: SubmitHandler<UnlockFormData> = (data) => {
    updateUnlockMutation.mutate(data);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    // ✨ 1. <form> 태그를 제거하고 일반 <Box>로 변경합니다.
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        스테이지 해금 설정
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600 }}>해금 스타일 설정</FormLabel>
        <Controller name="preset" control={control} render={({ field }) => (
          <RadioGroup {...field} row>
            <FormControlLabel value="fullscreen" control={<Radio />} label="풀 화면 형" />
            <FormControlLabel value="popup" control={<Radio />} label="팝업 형" />
          </RadioGroup>
        )} />
      </FormControl>

      <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>
          {selectedPreset === 'fullscreen' ? '풀 화면 형 설정' : '팝업 형 설정'}
        </Typography>
        {/* 자식 컴포넌트들은 form이 아니므로 그대로 둡니다. */}
        {selectedPreset === 'fullscreen' && <FullscreenForm control={control} />}
        {selectedPreset === 'popup' && <PopupForm control={control} />}
      </Card>
      
      <Box sx={{ mt: 3 }}>
        {/* ✨ 2. Button의 type을 "button"으로, onClick 이벤트로 handleSubmit을 실행합니다. */}
        <Button 
          type="button" 
          variant="contained" 
          onClick={handleSubmit(onSubmit)} 
          disabled={updateUnlockMutation.isPending}
        >
          {updateUnlockMutation.isPending ? '저장 중...' : '해금 정보 저장'}
        </Button>
      </Box>
    </Box>
  );
}