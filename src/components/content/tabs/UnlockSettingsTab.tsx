'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, Card, CircularProgress } from '@mui/material';
// [1. 수정] useForm에서 watch, setValue 추가
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useUpdateUnlock } from '@/hooks/mutation/useUpdateUnlock';
import { useGetStageById } from '@/hooks/query/useGetStageById';
import { UnlockConfigPayload } from '@/lib/api/admin';

import FullscreenForm from './unlock-presets/FullscreenForm';
import PopupForm from './unlock-presets/PopupForm';

interface UnlockSettingsTabProps {
  stageId?: string;
}

type UnlockFormData = UnlockConfigPayload;

export default function UnlockSettingsTab({ stageId }: UnlockSettingsTabProps) {
  const { data: existingStage, isLoading } = useGetStageById(stageId);
  const updateUnlockMutation = useUpdateUnlock(stageId);
  
  // [2. 수정] watch, setValue 추가
  const { control, handleSubmit, reset, watch, setValue } = useForm<UnlockFormData>({
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
        
        {/* [3. 수정] 자식 컴포넌트에 control, watch, setValue 전달 */}
        {selectedPreset === 'fullscreen' && (
          <FullscreenForm control={control} watch={watch} setValue={setValue} />
        )}
        {selectedPreset === 'popup' && (
          <PopupForm control={control} watch={watch} setValue={setValue} />
        )}
      </Card>
      
      <Box sx={{ mt: 3 }}>
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