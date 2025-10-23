'use client';

import { Box, TextField } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { FullHintFormData } from '../HintSettingsTab';

interface MiddleImageFormProps {
  control: Control<FullHintFormData>;
}

export default function MiddleImageForm({ control }: MiddleImageFormProps) {
  return (
    <Box>
      <Controller name="middleImage.topText" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="상단 텍스트" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="middleImage.mediaUrl" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="중간 이미지/영상 URL" fullWidth sx={{ mb: 2 }} placeholder="https://... 또는 유튜브 URL" />} />
      <Controller name="middleImage.bottomText" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="하단 텍스트" fullWidth sx={{ mb: 2 }} />} />
    </Box>
  );
}