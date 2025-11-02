'use client';

import { useState, useEffect } from 'react'; // [1. 수정] useEffect 추가
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress, // [2. 추가] 로딩 스피너
} from '@mui/material';
import { Add } from '@mui/icons-material';
import RewardRegisterModal from '@/components/rewards/RewardRegisterModal';
import MapDialog from '@/components/common/MapDialog';
import { useCreateStore } from '@/hooks/mutation/useCreateStore';
// [3. 수정] 수정에 필요한 훅과 타입들 import
import { useUpdateStore } from '@/hooks/mutation/useUpdateStore';
import { useGetStoreById } from '@/hooks/query/useGetStoreById';
import { StoreCreatePayload, StoreUpdatePayload, Store } from '@/lib/api/admin';

// (폼 데이터 타입은 동일)
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

// [4. 수정] props 인터페이스에 storeId 추가
interface StoreRegisterFormProps {
  mode: 'register' | 'edit';
  storeId?: string; // 수정 모드일 때 ID를 받음
}

export default function StoreRegisterForm({ mode, storeId }: StoreRegisterFormProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const isEditMode = mode === 'edit';

  // [5. 추가] 데이터 페칭 및 뮤테이션 훅
  const { data: existingData, isLoading: isLoadingData } = useGetStoreById(storeId);
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore(storeId!); // '!'는 isEditMode일 때만 호출

  // [6. 수정] react-hook-form에 'reset' 함수 추가
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<StoreFormData>({
    defaultValues: {
      store_name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      is_always_on: false,
      display_start_at: '',
      display_end_at: '',
      map_image_url: '',
      show_products: true,
    },
  });

  const isAlwaysOn = watch('is_always_on');

  // [7. 추가] 수정 모드일 때, 데이터를 불러오면 폼에 채워넣는 useEffect
  useEffect(() => {
    if (isEditMode && existingData) {
      // API 데이터(Store)를 폼 데이터(StoreFormData) 형식으로 변환
      
      // 날짜 형식을 'YYYY-MM-DD'로 변환 (input[type=date]의 value 형식)
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };

      const formData: StoreFormData = {
        store_name: existingData.store_name,
        description: existingData.description || '',
        address: existingData.address || '',
        latitude: existingData.latitude?.toString() || '',
        longitude: existingData.longitude?.toString() || '',
        is_always_on: existingData.is_always_on,
        display_start_at: formatDate(existingData.display_start_at),
        display_end_at: formatDate(existingData.display_end_at),
        map_image_url: existingData.map_image_url || '',
        show_products: existingData.show_products,
      };
      reset(formData); // 폼 값 전체 갱신
    }
  }, [isEditMode, existingData, reset]);


  // 8. [수정] 폼 제출(매장 저장) 핸들러 (수정/생성 분기)
  const onSubmit: SubmitHandler<StoreFormData> = (data) => {
    
    // 공통 페이로드
    const payload: StoreCreatePayload | StoreUpdatePayload = {
      store_name: data.store_name,
      description: data.description || null,
      address: data.address || null,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      is_always_on: data.is_always_on,
      display_start_at: !data.is_always_on && data.display_start_at ? new Date(data.display_start_at).toISOString() : null,
      display_end_at: !data.is_always_on && data.display_end_at ? new Date(data.display_end_at).toISOString() : null,
      map_image_url: data.map_image_url || null,
      show_products: data.show_products,
    };
    
    if (isEditMode) {
      // [수정] 수정 API 호출
      updateStoreMutation.mutate(payload as StoreUpdatePayload);
    } else {
      // [기존] 생성 API 호출
      createStoreMutation.mutate(payload as StoreCreatePayload);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat.toString());
    setValue('longitude', location.lng.toString());
  };

  // [9. 수정] 로딩 상태: 생성 또는 수정
  const isLoading = createStoreMutation.isPending || updateStoreMutation.isPending;
  const title = isEditMode ? '매장 수정' : '매장 등록';
  const buttonText = isEditMode ? '수정하기' : '매장 저장';

  // [10. 추가] 수정 모드에서 데이터 로딩 중일 때 스피너 표시
  if (isEditMode && isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        {title} {/* [수정] 동적 타이틀 */}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="store_name"
              control={control}
              rules={{ required: '매장명은 필수입니다.' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value || ''} // null/undefined 방지
                  label="매장명"
                  placeholder="매장명을 입력하세요"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            
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
                      value={field.value || ''}
                      type="date" 
                      sx={{ flex: 1 }} 
                      disabled={isAlwaysOn}
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
                      value={field.value || ''}
                      type="date" 
                      sx={{ flex: 1 }} 
                      disabled={isAlwaysOn}
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
                  placeholder="https://"
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

        {/* [11. 수정] '상품 추가' 버튼: 수정 모드일 때만 활성화 */}
        <Box sx={{ my: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setIsModalOpen(true)}
            disabled={!isEditMode} // 수정 모드일 때만 활성화
          >
            상품 추가
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
            {isLoading ? '저장 중...' : buttonText} {/* [수정] 동적 버튼 텍스트 */}
          </Button>
        </Box>
      </Box>

      {/* [12. 수정] 상품 추가 모달에 storeId 전달 */}
      <RewardRegisterModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="register"
        storeId={storeId}
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