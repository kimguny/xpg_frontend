'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // [수정] router 추가
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
} from '@mui/material';
import { useCreateNfcTag } from '@/hooks/mutation/useCreateNfcTag';
import { NFCTagCreatePayload } from '@/lib/api/admin';
import MapDialog from '@/components/common/MapDialog'; // [수정] MapDialog 추가

// [수정] 폼 데이터 타입 정의
type NfcFormData = {
  udid: string;
  tag_name: string;
  description: string; // [수정] '설명' 필드 추가
  address: string;
  latitude: string;
  longitude: string;
  floor_location: string;
  
  actionType: 'url' | 'message';
  link_url: string;
  media_url: string; // [수정] '미디어 URL' 필드 추가
  tap_message: string;
  
  point_reward: string;
  use_limit: string;
  cooldown_sec: string;
  is_active: 'Y' | 'N';
  category: string;
};

interface NfcRegisterFormProps {
  mode: 'register' | 'edit';
  // (참고: 'edit' 모드를 위해 'existingData?: NfcTag' prop이 추후 필요)
}

export default function NfcRegisterForm({ mode }: NfcRegisterFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  
  // [수정] MapDialog 상태 추가
  const [isMapOpen, setIsMapOpen] = useState(false);

  // [수정] react-hook-form 초기화 (UI 스크린샷 기반으로 필드 추가)
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<NfcFormData>({
    defaultValues: {
      udid: '',
      tag_name: '',
      description: '', // [수정] '설명' 필드 추가
      address: '',
      latitude: '',
      longitude: '',
      floor_location: '',
      actionType: 'url',
      link_url: '',
      media_url: '', // [수정] '미디어 URL' 필드 추가
      tap_message: '',
      point_reward: '0',
      use_limit: '0', 
      cooldown_sec: '0',
      is_active: 'Y',
      category: 'none',
    },
  });

  const createNfcTagMutation = useCreateNfcTag();

  const actionType = watch('actionType');
  const title = isEditMode ? 'NFC 태그 수정' : 'NFC 태그 등록';
  const buttonText = isEditMode ? 'NFC 수정' : 'NFC 저장';

  // [수정] 폼 제출 로직 (스크린샷 UI에 맞춰 필드 매핑)
  const onSubmit: SubmitHandler<NfcFormData> = (data) => {
    const payload: NFCTagCreatePayload = {
      udid: data.udid,
      tag_name: data.tag_name,
      // (참고: 'description'은 백엔드 API에 추가해야 저장됩니다)
      // description: data.description || null, 
      address: data.address || null,
      floor_location: data.floor_location || null,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      
      link_url: data.actionType === 'url' ? data.link_url : null,
      media_url: data.actionType === 'url' ? data.media_url : null, // [수정] media_url 추가
      tap_message: data.actionType === 'message' ? data.tap_message : null,
      
      point_reward: Number(data.point_reward) || 0,
      use_limit: Number(data.use_limit) > 0 ? Number(data.use_limit) : null, 
      cooldown_sec: Number(data.cooldown_sec) || 0,
      is_active: data.is_active === 'Y',
      category: data.category === 'none' ? null : data.category,
    };

    if (isEditMode) {
      alert('수정 기능은 아직 구현되지 않았습니다.');
    } else {
      createNfcTagMutation.mutate(payload);
    }
  };
  
  // [수정] 지도에서 위치 선택 시 폼 값을 업데이트하는 핸들러
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat.toString());
    setValue('longitude', location.lng.toString());
  };

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
              
              {/* [수정] '설명' 필드 추가 */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="설명" multiline rows={4} fullWidth />
                )}
              />
              
              {/* [수정] '주소 찾기' 버튼 제거 */}
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="주소" fullWidth />
                )}
              />
              
              {/* [수정] '지도에서 입력' 버튼 추가 */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => <TextField {...field} label="위도" fullWidth type="number" />}
                />
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => <TextField {...field} label="경도" fullWidth type="number" />}
                />
                <Button variant="outlined" sx={{ whiteSpace: 'nowrap', py: '15.5px' }} onClick={() => setIsMapOpen(true)}>
                  지도에서 입력
                </Button>
              </Box>
              
              <Controller
                name="floor_location"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="층/위치" placeholder="예: 목포역 XX 카페 1층" fullWidth />
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
                      <TextField {...field} label="연결 URL" fullWidth />
                    )}
                  />
                  {/* [수정] '미디어 파일 등록' UI 추가 */}
                  <Controller
                    name="media_url"
                    control={control}
                    render={({ field }) => (
                       <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField {...field} label="미디어 파일 등록 (URL)" fullWidth />
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
                    <TextField {...field} label="태그 시 메시지" placeholder="예: 첫 번째 힌트 발견!" fullWidth />
                  )}
                />
              )}
              
              <Controller
                name="point_reward"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="태그 포인트 설정" type="number" helperText="포인트 없는 경우 0 입력" fullWidth />
                )}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="use_limit"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="사용 횟수" type="number" helperText="0은 무제한" fullWidth />
                  )}
                />
                <Controller
                  name="cooldown_sec"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="쿨 다운 설정(초)" type="number" helperText="0은 없음" fullWidth />
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
                    <Select {...field} label="카테고리">
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
              disabled={createNfcTagMutation.isPending || isEditMode}
            >
              {createNfcTagMutation.isPending ? '저장 중...' : buttonText}
            </Button>
          </Box>
        </Card>
      </form>

      {/* [수정] MapDialog 렌더링 추가 */}
      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}