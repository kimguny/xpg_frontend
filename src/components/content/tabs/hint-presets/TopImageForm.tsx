'use client';

import { Box, TextField, Button, Avatar, Typography, IconButton } from '@mui/material';
import { useFieldArray, Controller, Control, useFormContext } from 'react-hook-form';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { FullHintFormData } from '../HintSettingsTab';
import { useRef, ChangeEvent } from 'react';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

const API_BASE_URL = 'http://121.126.223.205:8000';

interface TopImageFormProps {
  control: Control<FullHintFormData>;
}

export default function TopImageForm({ control }: TopImageFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'topImage.textBlocks',
  });

  const { setValue, watch } = useFormContext<FullHintFormData>();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImageUrl = watch('topImage.imageUrl');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            setValue('topImage.imageUrl', data.file_path, { shouldValidate: true });
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
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>상단 이미지 등록 (1개)</Typography>
      
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImageMutation.isPending}
            sx={{ minWidth: 80, py: '8.5px' }}
          >
            {uploadImageMutation.isPending ? '업로드 중...' : '파일 선택'}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }} 
          />
          <Controller
            name="topImage.imageUrl"
            control={control}
            defaultValue=""
            render={({ field }) => 
              <TextField 
                {...field} 
                label="이미지 URL" 
                fullWidth 
                size="small" 
                placeholder="https://... 또는 파일 업로드" 
                disabled={uploadImageMutation.isPending}
              />
            }
          />
        </Box>
        
        {currentImageUrl && (
          <Avatar
            src={getFullImageUrl(currentImageUrl)}
            alt="미리보기" 
            variant="rounded"
            sx={{ width: 150, height: 150, mt: 1, border: '1px solid', borderColor: 'grey.300' }}
          />
        )}
      </Box>
      
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