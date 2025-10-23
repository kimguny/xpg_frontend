'use client';

import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import { useFieldArray, Controller, Control } from 'react-hook-form';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { FullHintFormData } from '../HintSettingsTab';

interface TopImageFormProps {
  control: Control<FullHintFormData>;
}

export default function TopImageForm({ control }: TopImageFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'topImage.textBlocks',
  });

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>상단 이미지 등록</Typography>
      <Controller
        name="topImage.imageUrl"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="이미지 URL" fullWidth sx={{ mb: 2 }} placeholder="https://..." />}
      />
      
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>텍스트 박스</Typography>
      {fields.map((item, index) => (
        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Controller
            name={`topImage.textBlocks.${index}.text`}
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} label={`박스 ${index + 1} 내용`} fullWidth />}
          />
          <IconButton onClick={() => remove(index)} color="error">
            <RemoveCircleOutline />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddCircleOutline />} onClick={() => append({ text: '' })}>
        텍스트 박스 추가
      </Button>
    </Box>
  );
}