'use client';

import { useState, useEffect, useMemo } from 'react'; // [1. useMemo 추가]
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
  CircularProgress,
  Table, // [2. 테이블 관련 컴포넌트 추가]
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import RewardRegisterModal from '@/components/rewards/RewardRegisterModal';
import MapDialog from '@/components/common/MapDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog'; // [3. 삭제 확인 다이얼로그 추가]
import { useCreateStore } from '@/hooks/mutation/useCreateStore';
import { useUpdateStore } from '@/hooks/mutation/useUpdateStore';
import { useGetStoreById } from '@/hooks/query/useGetStoreById';
import { StoreCreatePayload, StoreUpdatePayload, Store, StoreReward } from '@/lib/api/admin';
import { useDeleteStoreReward } from '@/hooks/mutation/useDeleteStoreReward'; // [4. 상품 삭제 훅 추가]

const API_BASE_URL = 'http://121.126.223.205:8000';

// 폼 데이터 타입 (기존과 동일)
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

// Props 인터페이스 (기존과 동일)
interface StoreRegisterFormProps {
  mode: 'register' | 'edit';
  storeId?: string;
}

// [5. 추가] 상품 상태 칩 (리워드 관리 페이지에서 가져옴)
const getStatusChip = (reward: StoreReward) => {
  if (!reward.is_active) {
    return <Chip label="비활성" color="default" size="small" />;
  }
  if (reward.stock_qty === 0) {
    return <Chip label="품절" color="error" size="small" />;
  }
  if (reward.stock_qty !== null && reward.stock_qty <= 10) {
    return <Chip label="임박" color="warning" size="small" />;
  }
  return <Chip label="정상" color="success" size="small" />;
};


export default function StoreRegisterForm({ mode, storeId }: StoreRegisterFormProps) {
  const router = useRouter();
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const isEditMode = mode === 'edit';

  // 데이터 페칭 및 뮤테이션 훅 (기존과 동일)
  const { data: existingData, isLoading: isLoadingData } = useGetStoreById(storeId);
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore(storeId!);

  // [6. 추가] 상품 모달 및 삭제 관련 상태
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [rewardModalMode, setRewardModalMode] = useState<'register' | 'edit'>('register');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // [7. 추가] 상품 삭제 훅
  const deleteRewardMutation = useDeleteStoreReward();

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

  // 수정 모드 데이터 로드 (기존과 동일)
  useEffect(() => {
    if (isEditMode && existingData) {
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
      reset(formData);
    }
  }, [isEditMode, existingData, reset]);


  // 폼 제출(매장 저장) 핸들러 (기존과 동일)
  const onSubmit: SubmitHandler<StoreFormData> = (data) => {
    
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
      updateStoreMutation.mutate(payload as StoreUpdatePayload);
    } else {
      createStoreMutation.mutate(payload as StoreCreatePayload);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue('latitude', location.lat.toString());
    setValue('longitude', location.lng.toString());
  };

  // [8. 추가] 상품 모달 관련 핸들러
  const handleOpenRewardModal = (mode: 'register' | 'edit', rewardId: string | null = null) => {
    setRewardModalMode(mode);
    setSelectedRewardId(rewardId);
    setRewardModalOpen(true);
  };
  
  const handleCloseRewardModal = () => {
    setRewardModalOpen(false);
    setSelectedRewardId(null);
    // (상품 추가/수정 후 매장 데이터를 다시 불러올 수 있음)
    // queryClient.invalidateQueries({ queryKey: ['storeById', storeId] });
  };

  // [9. 추가] 상품 삭제 관련 핸들러
  const handleDeleteRewardClick = (rewardId: string) => {
    setSelectedRewardId(rewardId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDeleteReward = () => {
    if (selectedRewardId) {
      deleteRewardMutation.mutate(selectedRewardId);
    }
    setDeleteDialogOpen(false);
    setSelectedRewardId(null);
  };

  const isLoading = createStoreMutation.isPending || updateStoreMutation.isPending;
  const title = isEditMode ? '매장 수정' : '매장 등록';
  const buttonText = isEditMode ? '수정하기' : '매장 저장';

  // [10. 추가] 표시할 상품 목록 (useMemo 사용)
  const storeRewards = useMemo(() => {
    return (existingData?.rewards || []) as StoreReward[];
  }, [existingData]);


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
        {title}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* ... (매장 정보 폼 필드 - 기존과 동일) ... */}
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

        {/* --- [11. 추가] 상품 목록 테이블 --- */}
        {isEditMode && (
          <Box sx={{ mt: 5 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                매장 상품 관리
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => handleOpenRewardModal('register', null)}
              >
                상품 추가
              </Button>
            </Box>

            <Card>
              <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>이미지</TableCell>
                      <TableCell>리워드명</TableCell>
                      <TableCell>필요 포인트</TableCell>
                      <TableCell>재고</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>관리</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storeRewards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          이 매장에 등록된 상품이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      storeRewards.map((reward) => (
                        <TableRow key={reward.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                          <TableCell>
                            <Avatar 
                              src={reward.image_url 
                                    ? (reward.image_url.startsWith('/') 
                                        ? `${API_BASE_URL}${reward.image_url}` 
                                        : reward.image_url) 
                                    : ''} 
                              variant="rounded" 
                            />
                          </TableCell>
                          <TableCell>{reward.product_name}</TableCell>
                          <TableCell>{reward.price_coin.toLocaleString()} P</TableCell>
                          <TableCell>
                            {reward.stock_qty === null ? '무제한' : reward.stock_qty}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(reward)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ mr: 1 }} 
                              onClick={() => handleOpenRewardModal('edit', reward.id)}
                            >
                              수정
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small" 
                              onClick={() => handleDeleteRewardClick(reward.id)}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}
        {/* --- [상품 목록 테이블 끝] --- */}


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
            {isLoading ? '저장 중...' : buttonText}
          </Button>
        </Box>
      </Box>

      {/* [12. 수정] RewardRegisterModal 연동 */}
      <RewardRegisterModal
        open={rewardModalOpen}
        onClose={handleCloseRewardModal}
        mode={rewardModalMode}
        rewardId={selectedRewardId}
        storeId={storeId}
      />

      {/* [13. 추가] 상품 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteReward}
        title="상품 삭제"
        message={`정말로 이 상품을 삭제하시겠습니까?`}
        isPending={deleteRewardMutation.isPending}
      />

      <MapDialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </Box>
  );
}