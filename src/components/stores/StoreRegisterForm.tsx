'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import RewardRegisterModal from '@/components/rewards/RewardRegisterModal'; // 상품 등록 팝업
import MapDialog from '@/components/common/MapDialog'; // 지도 팝업
import { useCreateStore } from '@/hooks/mutation/useCreateStore'; // 1. 훅 import
import { StoreCreatePayload } from '@/lib/api/admin'; // 2. 타입 import

// 3. 폼 데이터 타입 정의
type StoreFormData = {
  store_name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  is_always_on: boolean;
  display_start_at: string;
  display_end_at: string;
  map_image_url: string;
  show_products: boolean;
};

export default function StoreRegisterForm() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false); // 4. 지도 모달 상태

  // 5. react-hook-form 및 API 훅 초기화
  const createStoreMutation = useCreateStore();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<StoreFormData>({
    defaultValues: {
      store_name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      is_always_on: false,
      display_start_at: '', // YYYY-MM-DD 형식
      display_end_at: '',   // YYYY-MM-DD 형식
      map_image_url: '',
      show_products: true,
    },
  });

  // '상시' 체크박스 값 감시
  const isAlwaysOn = watch('is_always_on');

  // 6. 폼 제출(매장 저장) 핸들러
  const onSubmit: SubmitHandler<StoreFormData> = (data) => {
    // 폼 데이터를 API 페이로드로 변환
    const payload: StoreCreatePayload = {
      store_name: data.store_name,
      description: data.description || null,
      address: data.address || null,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      is_always_on: data.is_always_on,
      // 상시가 아닐 때만 날짜를 전송 (DB 트리거 규칙 준수)
      display_start_at: !data.is_always_on ? new Date(data.display_start_at).toISOString() : null,
      display_end_at: !data.is_always_on ? new Date(data.display_end_at).toISOString() : null,
      map_image_url: data.map_image_url || null,
      show_products: data.show_products,
    };
    
    createStoreMutation.mutate(payload);
  };

  // 7. 지도 선택 핸들러
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat.toString());
    setValue('longitude', location.lng.toString());
  };

  const isLoading = createStoreMutation.isPending;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        매장 등록
      </Typography>

      {/* 8. form 태그와 onSubmit 핸들러 연결 */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 9. 모든 입력 필드를 Controller로 변경 */}
            <Controller
              name="store_name"
              control={control}
              rules={{ required: '매장명은 필수입니다.' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="매장명"
                  placeholder="매장명을 입력하세요"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            
            {/* (참고: 카테고리 필드는 UI엔 있으나 API 스키마에 없습니다. 우선 제외합니다.) */}

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  value={field.value || ''} 
                  label="주소" 
                  placeholder="주소를 입력하세요" 
                />
              )}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || ''} fullWidth label="위도" />
                )}
              />
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value || ''} fullWidth label="경도" />
                )}
              />
              {/* [수정] 지도에서 입력 버튼 */}
              <Button 
                variant="outlined" 
                sx={{ minWidth: '130px', py: '15.5px' }} 
                onClick={() => setIsMapOpen(true)}
              >
                지도에서 입력
              </Button>
            </Box>
            
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ''}
                  label="매장 설명"
                  multiline
                  rows={4}
                  placeholder="매장에 대한 설명을 입력하세요."
                />
              )}
            />
            
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                노출 기간
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name="display_start_at"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field}
                      type="date" 
                      sx={{ flex: 1 }} 
                      disabled={isAlwaysOn} // 상시 체크 시 비활성화
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Typography>~</Typography>
                <Controller
                  name="display_end_at"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field}
                      type="date" 
                      sx={{ flex: 1 }} 
                      disabled={isAlwaysOn} // 상시 체크 시 비활성화
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <Controller
                  name="is_always_on"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel 
                      control={<Checkbox {...field} checked={field.value} />} 
                      label="상시" 
                    />
                  )}
                />
              </Box>
            </Box>

            <Controller
              name="map_image_url"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field}
                  value={field.value || ''}
                  label="매장 이미지(약도) URL"
                  placeholder="https://..."
                />
              )}
            />
            
            <Controller
              name="show_products"
              control={control}
              render={({ field }) => (
                <FormControlLabel 
                  control={<Checkbox {...field} checked={field.value} />} 
                  label="앱 내 상품 노출" 
                />
              )}
            />
          </Box>
        </Card>

        {/* 상품 추가 버튼 (기능은 추후 구현) */}
        <Box sx={{ my: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setIsModalOpen(true)}
            disabled // [수정] 매장 등록 전에는 상품 추가 비활성화
          >
            상품 추가 (매장 저장 후)
          </Button>
        </Box>

        {/* 하단 저장 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => router.push('/save/stores/manage')}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            color="success"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '매장 저장'}
          </Button>
        </Box>
      </Box>

      {/* 상품 추가 팝업 (재사용) */}
      <RewardRegisterModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="register"
        // storeId={undefined}
      />

      {/* 지도 팝업 */}
      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}