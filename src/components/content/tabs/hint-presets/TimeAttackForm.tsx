'use client';

import { Box, TextField } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
import { FullHintFormData } from '../HintSettingsTab';

interface TimeAttackFormProps {
  control: Control<FullHintFormData>;
}

export default function TimeAttackForm({ control }: TimeAttackFormProps) {
  return (
    <Box>
      <Controller name="timeAttack.timeLimit" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="타임 어택 시간 (초)" type="number" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="timeAttack.retryCooldown" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="미션 실패 재시도 쿨타임 (초)" type="number" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="timeAttack.bottomText" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="하단 텍스트" fullWidth sx={{ mb: 2 }} />} />
    </Box>
  );
}