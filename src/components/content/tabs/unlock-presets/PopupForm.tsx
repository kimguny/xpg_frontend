'use client';

// [1. 수정] import 문 확장
import { Box, TextField, RadioGroup, FormControlLabel, Radio, FormLabel, FormControl, Button, Avatar, Typography } from '@mui/material';
import { Controller, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { UnlockConfigPayload } from '@/lib/api/admin';
// [2. 추가] 이미지 업로드용 훅 및 유틸리티 import
import { useRef, ChangeEvent } from 'react';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

// [3. 추가] API Base URL
const API_BASE_URL = 'http://121.126.223.205:8000';

// [4. 수정] Props 인터페이스 확장
interface PopupFormProps {
  control: Control<UnlockConfigPayload>;
  watch: UseFormWatch<UnlockConfigPayload>;
  setValue: UseFormSetValue<UnlockConfigPayload>;
}

export default function PopupForm({ control, watch, setValue }: PopupFormProps) {
  // [5. 추가] 이미지 업로드 및 미리보기 로직
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentImageUrl = watch('image_url');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    uploadImageMutation.mutate(formData, {
        onSuccess: (data) => {
            setValue('image_url', data.file_path, { shouldValidate: true });
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
      <Controller name="title" control={control} render={({ field }) => <TextField {...field} value={field.value || ''} label="서브 타이틀 입력" fullWidth sx={{ mb: 2 }} />} />
      <Controller name="bottom_text" control={control} render={({ field }) => <TextField {...field} value={field.value || ''} label="하단 텍스트 입력" fullWidth sx={{ mb: 2 }} />} />
      
      {/* [6. 수정] 이미지 업로드 UI 추가 */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>이미지 등록 (1개)</Typography>
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
            name="image_url"
            control={control}
            render={({ field }) => 
              <TextField 
                {...field} 
                value={field.value || ''}
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