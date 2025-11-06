'use client';

// [1. import 문 확장]
import { Box, Button, TextField, Typography, IconButton, Avatar } from '@mui/material';
import { useFieldArray, Controller, Control, useFormContext } from 'react-hook-form';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { FullHintFormData } from '../HintSettingsTab';
import { useRef, ChangeEvent } from 'react';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

// [2. API Base URL]
const API_BASE_URL = 'http://121.126.223.205:8000';

interface CardSwipeFormProps {
  control: Control<FullHintFormData>;
}

// [3. 각 카드 내부의 이미지 업로드를 처리하는 하위 컴포넌트]
const CardImageUpload = ({ cardIndex, control }: { cardIndex: number, control: Control<FullHintFormData> }) => {
  
  const { setValue, watch } = useFormContext<FullHintFormData>();
  const uploadImageMutation = useUploadImage();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const { fields, append, remove } = useFieldArray({
    control,
    name: `cardSwipe.cards.${cardIndex}.images`,
  });

  const currentImages = watch(`cardSwipe.cards.${cardIndex}.images`);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            setValue(`cardSwipe.cards.${cardIndex}.images.${imageIndex}.url`, data.file_path, { shouldValidate: true });
        },
        onError: (err) => {
            alert(`이미지 업로드 실패: ${err.message}`);
        }
    });
    e.target.value = '';
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
  };

  return (
    <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2, mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>카드 이미지 등록 (최대 3개)</Typography>
      {fields.map((item, index) => (
        <Box key={item.id} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
            <Button 
              variant="contained" 
              size="small" 
              onClick={() => fileInputRefs.current[index]?.click()}
              disabled={uploadImageMutation.isPending}
              sx={{ minWidth: 80, py: '8.5px' }}
            >
              {uploadImageMutation.isPending ? '업로드 중...' : '파일 선택'}
            </Button>
            <input 
              type="file" 
              ref={(el) => { if(el) fileInputRefs.current[index] = el; }} 
              onChange={(e) => handleFileChange(e, index)}
              accept="image/*"
              style={{ display: 'none' }} 
            />
            <Controller
              name={`cardSwipe.cards.${cardIndex}.images.${index}.url`}
              control={control}
              defaultValue=""
              render={({ field }) => 
                <TextField 
                  {...field} 
                  label={`이미지 ${index + 1} URL`}
                  fullWidth 
                  size="small" 
                  placeholder="https://... 또는 파일 업로드" 
                  disabled={uploadImageMutation.isPending}
                />
              }
            />
            <IconButton onClick={() => remove(index)} color="error" size="small">
              <RemoveCircleOutline fontSize="small" />
            </IconButton>
          </Box>
          {currentImages?.[index]?.url && (
            <Avatar
              src={getFullImageUrl(currentImages[index].url)}
              alt="미리보기" 
              variant="rounded"
              sx={{ width: 100, height: 100, border: '1px solid', borderColor: 'grey.300' }}
            />
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddCircleOutline />}
        onClick={() => append({ url: '' })}
        disabled={fields.length >= 3}
        size="small"
      >
        이미지 추가 (최대 3개)
      </Button>
    </Box>
  );
};

// [4. 메인 CardSwipeForm 컴포넌트]
export default function CardSwipeForm({ control }: CardSwipeFormProps) {
  
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
            {fields.length > 0 && (
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
          
          {/* [5. 각 카드 내부에 중첩된 이미지 업로드 폼 렌더링] */}
          <CardImageUpload cardIndex={index} control={control} />

        </Box>
      ))}
      <Button
        startIcon={<AddCircleOutline />}
        onClick={() => append({ title: '', text: '', images: [] })} // images 빈 배열로 초기화
        disabled={fields.length >= 3}
      >
        카드 추가 (최대 3개)
      </Button>
    </Box>
  );
}