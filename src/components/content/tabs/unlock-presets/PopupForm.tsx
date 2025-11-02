'use client';

import { Box, TextField, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { UnlockConfigPayload } from '@/lib/api/admin';

interface PopupFormProps {
  control: Control<UnlockConfigPayload>;
}

export default function PopupForm({ control }: PopupFormProps) {
  return (
    <Box>
      <Controller name="title" control={control} render={({ field }) => <TextField {...field} value={field.value || ''} label="서브 타이틀 입력" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="bottom_text" control={control} render={({ field }) => <TextField {...field} value={field.value || ''} label="하단 텍스트 입력" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="image_url" control={control} render={({ field }) => <TextField {...field} value={field.value || ''} label="이미지 URL" fullWidth sx={{ mb: 2 }} />} />
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>다음 액션</FormLabel>
        <Controller name="next_action" control={control} render={({ field }) => (
          <RadioGroup {...field} row>
            <FormControlLabel value="next_step" control={<Radio size="small" />} label="다음 단계로" />
            <FormControlLabel value="next_stage" control={<Radio size="small" />} label="다음 스테이지로" />
          </RadioGroup>
        )} />
      </FormControl>
    </Box>
  );
}