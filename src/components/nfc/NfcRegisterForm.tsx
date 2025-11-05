'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
} from '@mui/material';

import { useCreateNfcTag } from '@/hooks/mutation/useCreateNfcTag';
import { useUpdateNfcTag } from '@/hooks/mutation/useUpdateNfcTag';
import { useGetNfcTagById } from '@/hooks/query/useGetNfcTagById';
import { NFCTagCreatePayload, NFCTagUpdatePayload } from '@/lib/api/admin';
import MapDialog from '@/components/common/MapDialog';
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

type NfcFormData = {
  udid: string;
  tag_name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  floor_location: string;
  actionType: 'url' | 'message';
  link_url: string;
  media_url: string;
  tap_message: string;
  point_reward: string;
  use_limit: string;
  cooldown_sec: string;
  is_active: 'Y' | 'N';
  category: string;
};

const API_BASE_URL = 'http://121.126.223.205:8000';

interface NfcRegisterFormProps {
  mode: 'register' | 'edit';
  nfcId?: string; 
}

export default function NfcRegisterForm({ mode, nfcId }: NfcRegisterFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImage();

  const { data: existingData, isLoading: isLoadingData } = useGetNfcTagById(nfcId);
  const createNfcTagMutation = useCreateNfcTag();
  const updateNfcTagMutation = useUpdateNfcTag(nfcId!); 

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NfcFormData>({
    defaultValues: {
      udid: '',
      tag_name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      floor_location: '',
      actionType: 'url',
      link_url: '',
      media_url: '',
      tap_message: '',
      point_reward: '0',
      use_limit: '0',
      cooldown_sec: '0',
      is_active: 'Y',
      category: 'none',
    },
  });

  useEffect(() => {
    if (isEditMode && existingData) {
      const formData: NfcFormData = {
        udid: existingData.udid,
        tag_name: existingData.tag_name,
        description: existingData.description || '',
        address: existingData.address || '',
        latitude: existingData.latitude?.toString() || '',
        longitude: existingData.longitude?.toString() || '',
        floor_location: existingData.floor_location || '',
        actionType: existingData.tap_message ? 'message' : 'url',
        link_url: existingData.link_url || '',
        media_url: existingData.media_url || '',
        tap_message: existingData.tap_message || '',
        point_reward: (existingData.point_reward || 0).toString(),
        use_limit: (existingData.use_limit || 0).toString(),
        cooldown_sec: (existingData.cooldown_sec || 0).toString(),
        is_active: existingData.is_active ? 'Y' : 'N',
        category: existingData.category || 'none',
      };
      reset(formData);
    }
  }, [isEditMode, existingData, reset]);

  const actionType = watch('actionType');
  const mediaUrl = watch('media_url'); 
  const title = isEditMode ? 'NFC 태그 수정' : 'NFC 태그 등록';
  const buttonText = isEditMode ? 'NFC 수정' : 'NFC 저장';
  
  const onSubmit: SubmitHandler<NfcFormData> = (data) => {
    
    if (isEditMode) {
      const updatePayload: NFCTagUpdatePayload = {
        tag_name: data.tag_name || undefined,
        description: data.description || null,
        address: data.address || null,
        floor_location: data.floor_location || null,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        link_url: data.actionType === 'url' ? data.link_url : null,
        media_url: data.actionType === 'url' ? data.media_url : null,
        tap_message: data.actionType === 'message' ? data.tap_message : null,
        point_reward: Number(data.point_reward) || 0,
        use_limit: Number(data.use_limit) > 0 ? Number(data.use_limit) : null,
        cooldown_sec: Number(data.cooldown_sec) || 0,
        is_active: data.is_active === 'Y',
        category: data.category === 'none' ? null : data.category,
      };
      updateNfcTagMutation.mutate(updatePayload);

    } else {
      const createPayload: NFCTagCreatePayload = {
        udid: data.udid,
        tag_name: data.tag_name,
        description: data.description,
        address: data.address || null,
        floor_location: data.floor_location || null,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        link_url: data.actionType === 'url' ? data.link_url : null,
        media_url: data.actionType === 'url' ? data.media_url : null,
        tap_message: data.actionType === 'message' ? data.tap_message : null,
        point_reward: Number(data.point_reward) || 0,
        use_limit: Number(data.use_limit) > 0 ? Number(data.use_limit) : null,
        cooldown_sec: Number(data.cooldown_sec) || 0,
        is_active: data.is_active === 'Y',
        category: data.category === 'none' ? null : data.category,
      };
      createNfcTagMutation.mutate(createPayload);
    }
  };
  
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat.toString());
    setValue('longitude', location.lng.toString());
  };

  const handleSelectFileClick = () => {
      mediaFileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      uploadImageMutation.mutate(formData, {
          onSuccess: (data) => {
              setValue('media_url', data.file_path, { shouldValidate: true }); 
              alert('이미지가 업로드되어 URL에 반영되었습니다.');
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

  if (isEditMode && isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSubmitting = createNfcTagMutation.isPending || updateNfcTagMutation.isPending || uploadImageMutation.isPending;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Left Column */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Controller
                name="udid"
                control={control}
                rules={{ required: 'UDID는 필수입니다.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="UDID"
                    placeholder="NFC 태그를 스캔하여 UDID 입력"
                    fullWidth
                    InputProps={{ readOnly: isEditMode }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              
              <Controller
                name="tag_name"
                control={control}
                rules={{ required: '태그명은 필수입니다.' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="태그명"
                    placeholder="예: mokpo_001 (구분하기 쉬운 이름)"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || ''} label="설명" multiline rows={4} fullWidth />
                )}
              />
              
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || ''} label="주소" fullWidth />
                )}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => <TextField {...field} value={field.value || ''} label="위도" fullWidth type="number" />}
                />
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => <TextField {...field} value={field.value || ''} label="경도" fullWidth type="number" />}
                />
                <Button variant="outlined" sx={{ minWidth: '130px', py: '15.5px' }} onClick={() => setIsMapOpen(true)}>
                  지도에서 입력
                </Button>
              </Box>
              
              <Controller
                name="floor_location"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || ''} label="층/위치" placeholder="예: 목포역 XX 카페 1층" fullWidth />
                )}
              />
            </Box>

            {/* Right Column */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <FormControl component="fieldset">
                <Controller
                  name="actionType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="url" control={<Radio />} label="연결 URL / 미디어 파일" />
                      <FormControlLabel value="message" control={<Radio />} label="태그 시 메시지 표시" />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              
              {actionType === 'url' && (
                <>
                  <Controller
                    name="link_url"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} value={field.value || ''} label="연결 URL" fullWidth />
                    )}
                  />
                  <Controller
                    name="media_url"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <TextField 
                            {...field} 
                            value={field.value || ''} 
                            label="미디어 파일 등록 (URL)" 
                            fullWidth 
                            disabled={uploadImageMutation.isPending}
                          />
                          <Button 
                            variant="outlined" 
                            sx={{ whiteSpace: 'nowrap', py: '15.5px' }} 
                            onClick={handleSelectFileClick}
                            disabled={uploadImageMutation.isPending}
                          >
                            {uploadImageMutation.isPending ? '업로드 중...' : '파일 선택'}
                          </Button>
                        </Box>
                        <input 
                            type="file" 
                            ref={mediaFileInputRef} 
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/gif"
                            style={{ display: 'none' }} 
                        />
                        {mediaUrl && (
                          <Avatar
                            src={getFullImageUrl(mediaUrl)}
                            alt="미디어 미리보기" 
                            variant="rounded"
                            sx={{ width: 100, height: 100, mt: 1, border: '1px solid', borderColor: 'grey.300' }}
                          />
                        )}
                      </Box>
                    )}
                  />
                </>
              )}
              
              {actionType === 'message' && (
                <Controller
                  name="tap_message"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value || ''} label="태그 시 메시지" placeholder="예: 첫 번째 힌트 발견!" fullWidth />
                  )}
                />
              )}
              
              <Controller
                name="point_reward"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || '0'} label="태그 포인트 설정" type="number" helperText="포인트 없는 경우 0 입력" fullWidth />
                )}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="use_limit"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value || '0'} label="사용 횟수" type="number" helperText="0은 무제한" fullWidth />
                  )}
                />
                <Controller
                  name="cooldown_sec"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} value={field.value || '0'} label="쿨 다운 설정(초)" type="number" helperText="0은 없음" fullWidth />
                  )}
                />
              </Box>
              
              <FormControl component="fieldset">
                <Typography component="legend" variant="body2" sx={{ color: 'text.secondary' }}>활성화</Typography>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <FormControlLabel value="Y" control={<Radio />} label="Y" />
                      <FormControlLabel value="N" control={<Radio />} label="N" />
                    </RadioGroup>
                  )}
                />
              </FormControl>
              
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>카테고리</InputLabel>
                    <Select {...field} value={field.value || 'none'} label="카테고리">
                      <MenuItem value="none">없음</MenuItem>
                      <MenuItem value="hint">스테이지 힌트</MenuItem>
                      <MenuItem value="checkpoint">체크 포인트</MenuItem>
                      <MenuItem value="base">거점/기지</MenuItem>
                      <MenuItem value="safezone">안전지대</MenuItem>
                      <MenuItem value="treasure">보물</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => router.push('/save/nfc/manage')}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : buttonText}
            </Button>
          </Box>
        </Card>
      </form>

      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}