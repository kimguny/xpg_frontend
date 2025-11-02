'use client';

import React, { useState, useEffect } from 'react'; // [1. 수정] useEffect 추가
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
  CircularProgress, // [2. 추가] 로딩 스피너
} from '@mui/material';

// [3. 수정] 필요한 훅과 타입을 모두 import
import { useCreateNfcTag } from '@/hooks/mutation/useCreateNfcTag';
import { useUpdateNfcTag } from '@/hooks/mutation/useUpdateNfcTag';
import { useGetNfcTagById } from '@/hooks/query/useGetNfcTagById';
import { NFCTagCreatePayload, NFCTagUpdatePayload } from '@/lib/api/admin';
import MapDialog from '@/components/common/MapDialog';

// (폼 데이터 타입은 동일)
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

// [4. 수정] nfcId prop 추가
interface NfcRegisterFormProps {
  mode: 'register' | 'edit';
  nfcId?: string; // 'edit' 모드일 때 ID를 받음
}

export default function NfcRegisterForm({ mode, nfcId }: NfcRegisterFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  const [isMapOpen, setIsMapOpen] = useState(false);

  // [5. 추가] 데이터 페칭 및 뮤테이션 훅
  const { data: existingData, isLoading: isLoadingData } = useGetNfcTagById(nfcId);
  const createNfcTagMutation = useCreateNfcTag();
  const updateNfcTagMutation = useUpdateNfcTag(nfcId!); // '!'는 isEditMode일 때만 호출되므로 안전

  // [6. 수정] react-hook-form의 'reset' 함수 추가
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

  // [7. 추가] 수정 모드일 때, 데이터를 불러오면 폼에 채워넣는 useEffect
  useEffect(() => {
    if (isEditMode && existingData) {
      // API 데이터(NfcTag)를 폼 데이터(NfcFormData) 형식으로 변환
      const formData: NfcFormData = {
        udid: existingData.udid,
        tag_name: existingData.tag_name,
        description: existingData.description || '',
        address: existingData.address || '',
        latitude: existingData.latitude?.toString() || '',
        longitude: existingData.longitude?.toString() || '',
        floor_location: existingData.floor_location || '',
        // 'tap_message'가 있으면 'message' 타입, 아니면 'url' 타입
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
      reset(formData); // react-hook-form의 reset으로 폼 값 전체 갱신
    }
  }, [isEditMode, existingData, reset]);

  const actionType = watch('actionType');
  const title = isEditMode ? 'NFC 태그 수정' : 'NFC 태그 등록';
  const buttonText = isEditMode ? 'NFC 수정' : 'NFC 저장';
  
  // [8. 수정] onSubmit 로직 (생성/수정 분기 처리)
  const onSubmit: SubmitHandler<NfcFormData> = (data) => {
    
    if (isEditMode) {
      // 1. 수정 모드일 때 (tag_name은 optional)
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
      // 2. 생성 모드일 때 (udid, tag_name은 required string)
      // (react-hook-form의 'rules'가 이 값들을 보장해야 함)
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

  // [9. 추가] 수정 모드에서 데이터 로딩 중일 때 스피너 표시
  if (isEditMode && isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // [10. 수정] 로딩 상태 변수명 변경
  const isSubmitting = createNfcTagMutation.isPending || updateNfcTagMutation.isPending;

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
                    // [11. 수정] 수정 모드일 때 UDID는 읽기 전용(readOnly)
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
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField {...field} value={field.value || ''} label="미디어 파일 등록 (URL)" fullWidth />
                        <Button variant="outlined" sx={{ whiteSpace: 'nowrap', py: '15.5px' }} disabled>
                          파일 선택
                        </Button>
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
          
          {/* Submit Button */}
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
              // [12. 수정] 로딩 상태 변수명 변경
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