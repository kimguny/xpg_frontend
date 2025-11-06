'use client';

import { Box, TextField, Button, Avatar, Typography } from '@mui/material';
import { Controller, Control, useFormContext } from 'react-hook-form';
import { FullHintFormData } from '../HintSettingsTab';
import { useRef, ChangeEvent } from 'react';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

const API_BASE_URL = 'http://121.126.223.205:8000';

interface MiddleImageFormProps {
  control: Control<FullHintFormData>;
}

export default function MiddleImageForm({ control }: MiddleImageFormProps) {
  const { setValue, watch } = useFormContext<FullHintFormData>();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImageUrl = watch('middleImage.mediaUrl');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            setValue('middleImage.mediaUrl', data.file_path, { shouldValidate: true });
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
      <Controller name="middleImage.topText" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="상단 텍스트" fullWidth sx={{ mb: 2 }} />} />
      
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>중간 이미지 등록 (1개)</Typography>
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
            name="middleImage.mediaUrl"
            control={control}
            defaultValue=""
            render={({ field }) => 
              <TextField 
                {...field} 
                label="중간 이미지 URL" 
                fullWidth 
                size="small" 
                placeholder="https://... 또는 파일 업로드" 
                disabled={uploadImageMutation.isPending}
              />
            }
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          * 영상(유튜브) URL은 지원되지 않으며, 이미지 URL만 입력 가능합니다.
        </Typography>

        {currentImageUrl && (
          <Avatar
            src={getFullImageUrl(currentImageUrl)}
            alt="미리보기" 
            variant="rounded"
            sx={{ width: 150, height: 150, mt: 2, border: '1px solid', borderColor: 'grey.300' }}
          />
        )}
      </Box>

      <Controller name="middleImage.bottomText" control={control} defaultValue="" render={({ field }) => <TextField {...field} label="하단 텍스트" fullWidth sx={{ mb: 2 }} />} />
    </Box>
  );
}