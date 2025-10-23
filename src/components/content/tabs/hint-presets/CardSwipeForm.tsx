'use client';

import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
// ✨ 1. react-hook-form에서 필요한 타입들을 import 합니다.
import { useFieldArray, Controller, Control } from 'react-hook-form';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { FullHintFormData } from '../HintSettingsTab';

// ✨ 3. 부모로부터 받을 props의 타입을 'any' 대신 정확하게 지정합니다.
interface CardSwipeFormProps {
  control: Control<FullHintFormData>;
}

export default function CardSwipeForm({ control }: CardSwipeFormProps) {
  // ✨ 4. useFieldArray에도 타입을 명시해줍니다.
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cardSwipe.cards',
  });

  return (
    <Box>
      {fields.map((item, index) => (
        <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography fontWeight="bold">카드 #{index + 1}</Typography>
            {fields.length > 1 && ( // 카드가 1개일 때는 삭제 버튼을 숨깁니다.
              <IconButton onClick={() => remove(index)} color="error" size="small">
                <RemoveCircleOutline />
              </IconButton>
            )}
          </Box>
          <Controller
            name={`cardSwipe.cards.${index}.title`}
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} label="카드 타이틀" fullWidth sx={{ mb: 2 }} />}
          />
          <Controller
            name={`cardSwipe.cards.${index}.text`}
            control={control}
            defaultValue=""
            render={({ field }) => <TextField {...field} label="카드 텍스트" fullWidth multiline rows={3} sx={{ mb: 2 }} />}
          />
          {/* TODO: 이미지, NFC, 보상 필드 추가 */}
        </Box>
      ))}
      <Button
        startIcon={<AddCircleOutline />}
        onClick={() => append({ title: '', text: '' })}
      >
        카드 추가
      </Button>
    </Box>
  );
}