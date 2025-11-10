'use client';

// [수정 1. Import 축소]
import { 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Typography
} from '@mui/material';
// Card, Radio, FormControl 등 불필요한 임포트 제거
import { Controller, Control, useFormContext } from 'react-hook-form';
import { FullHintFormData } from '../HintSettingsTab';
import { useRef, ChangeEvent } from 'react';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

const API_BASE_URL = 'http://121.126.223.205:8000';

interface ArCameraFormProps {
  control: Control<FullHintFormData>;
}

export default function ArCameraForm({ control }: ArCameraFormProps) {
  
  const { setValue, watch } = useFormContext<FullHintFormData>();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImageUrl = watch('arCamera.imageUrl');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            setValue('arCamera.imageUrl', data.file_path, { shouldValidate: true });
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
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>AR 이미지 등록 (1개)</Typography>
      
      {/* AR 이미지 등록 UI (기존과 동일) */}
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
            name="arCamera.imageUrl"
            control={control}
            defaultValue=""
            render={({ field }) => 
              <TextField 
                {...field} 
                label="AR 인식용 이미지 URL" 
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
      
      {/* [수정 2. 정답 입력 UI 단순화] */}
      {/* Card, RadioGroup, bonusCoin 필드 모두 제거 */}
      <Box sx={{ mt: 2 }}>
        <Controller
          name="arCamera.answer"
          control={control}
          defaultValue=""
          rules={{ required: '정답을 입력해야 합니다.' }}
          render={({ field, fieldState: { error } }) => (
            <TextField 
              {...field} 
              label="정답" 
              fullWidth // fullWidth로 변경
              required 
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Box>
    </Box>
  );
}