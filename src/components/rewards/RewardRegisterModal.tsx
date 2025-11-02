'use client';

import { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress, // 로딩 표시를 위해 추가
} from '@mui/material';

//  훅 및 타입 임포트 추가/수정
import { useCreateStoreReward } from '@/hooks/mutation/useCreateStoreReward';
import { useUpdateStoreReward } from '@/hooks/mutation/useUpdateStoreReward'; // 수정 훅 추가
import { useGetStoreRewardById } from '@/hooks/query/useGetStoreRewardById'; // 상세 조회 훅 추가
import { StoreRewardCreatePayload, StoreRewardUpdatePayload } from '@/lib/api/admin';

// 1. [수정] Props 인터페이스: rewardId를 추가하여 타입 오류 해결
interface RewardRegisterModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'register' | 'edit';
  storeId?: string; 
  //  타입 오류 해결: rewardId 추가
  rewardId?: string | null; 
}

// 2. 폼 데이터 타입은 그대로 유지
type RewardFormData = {
  product_name: string;
  product_desc: string;
  image_url: string;
  price_coin: string;
  stock_qty: string;
  is_unlimited: boolean; 
  is_active: boolean;
};

export default function RewardRegisterModal({ open, onClose, mode, storeId, rewardId }: RewardRegisterModalProps) {
  
  const isEditMode = mode === 'edit' && !!rewardId;

  //  훅 초기화: storeId는 유효성 검사를 위해 사용
  const validStoreId = storeId || ''; 
  const createRewardMutation = useCreateStoreReward(validStoreId);
  const updateRewardMutation = useUpdateStoreReward(); //  수정 훅 초기화

//  수정 모드 데이터 로딩 훅
  const { data: initialData, isLoading: isDataLoading } = useGetStoreRewardById(
    isEditMode ? rewardId : null
  );
  
  // 3. react-hook-form 초기화는 그대로 유지
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RewardFormData>({
    defaultValues: {
      product_name: '',
      product_desc: '',
      image_url: '',
      price_coin: '0',
      stock_qty: '100',
      is_unlimited: false,
      is_active: true,
    },
  });

  const isUnlimited = watch('is_unlimited');

  // 4. 재고 무제한 체크 시 수량 필드 비활성화 로직 (유지)
  useEffect(() => {
    if (isUnlimited) {
      setValue('stock_qty', '');
    }
  }, [isUnlimited, setValue]);

  // 5. 모달이 열릴 때/데이터 로딩 완료 시 폼 리셋 및 데이터 바인딩 로직 추가
  useEffect(() => {
    if (open) {
        if (isEditMode && initialData) {
            //  수정 모드: API 데이터로 폼 채우기
            reset({
                product_name: initialData.product_name,
                product_desc: initialData.product_desc || '',
                image_url: initialData.image_url || '',
                price_coin: String(initialData.price_coin),
                stock_qty: initialData.stock_qty === null ? '' : String(initialData.stock_qty),
                is_unlimited: initialData.stock_qty === null,
                is_active: initialData.is_active,
            });
        } else if (!isEditMode) {
            //  등록 모드: 기본값으로 리셋
            reset();
        }
    }
    //  모달이 닫힐 때만 리셋하는 로직은 제거하고, open/mode 변경 시 리셋/바인딩하도록 수정했습니다.
  }, [open, isEditMode, initialData, reset]);


  // 6. [수정] 폼 제출(상품 등록/수정) 핸들러
  const onSubmit: SubmitHandler<RewardFormData> = (data) => {
    
    // API Payload 변환 로직
    const payload = {
      product_name: data.product_name,
      product_desc: data.product_desc || null,
      image_url: data.image_url || null,
      price_coin: Number(data.price_coin) || 0,
      stock_qty: data.is_unlimited ? null : (data.stock_qty ? Number(data.stock_qty) : 0), 
      is_active: data.is_active,
    };
    
    if (isEditMode && rewardId) {
      //  수정 모드 API 호출
      updateRewardMutation.mutate({ 
        rewardId, 
        payload: payload as StoreRewardUpdatePayload
      }, {
        onSuccess: () => onClose(),
        onError: (err) => alert(`상품 수정 실패: ${err.message}`),
      });
    } else {
      if (!storeId) {
        alert('매장 ID가 없어 상품을 등록할 수 없습니다.');
        return;
      }
      //  등록 모드 API 호출
      createRewardMutation.mutate(payload as StoreRewardCreatePayload, {
        onSuccess: () => {
          onClose(); // 성공 시 모달 닫기
        },
        onError: (err) => alert(`상품 등록 실패: ${err.message}`),
      });
    }
  };

  const isLoading = createRewardMutation.isPending || updateRewardMutation.isPending;
  
  if (isEditMode && isDataLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>상품 데이터 불러오는 중...</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEditMode ? '상품 수정' : '상품 등록'}
      </DialogTitle>
      
      {/* 7. <form> 태그와 onSubmit 핸들러 연결 */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            <Controller
              name="product_name"
              control={control}
              rules={{ required: '상품명은 필수입니다.' }}
              render={({ field, fieldState }) => (
                <TextField 
                  {...field} 
                  label="상품명" 
                  placeholder="예: 장미의 거리 이벤트 기념품" 
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            
            <Controller
              name="product_desc"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="설명" 
                  placeholder="상품 설명 및 사이즈 등" 
                  multiline 
                  rows={3} 
                  fullWidth
                />
              )}
            />

            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="제품 이미지 URL" 
                  placeholder="https://" 
                  fullWidth
                />
              )}
            />

            <Controller
              name="price_coin"
              control={control}
              rules={{ required: '필수, 반드시 입력' }}
              render={({ field, fieldState }) => (
                <TextField 
                  {...field} 
                  label="개당 포인트" 
                  type="number" 
                  placeholder="예: 3000" 
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Controller
                name="stock_qty"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="제공 상품 수 (재고)" 
                    type="number" 
                    placeholder="예: 10" 
                    disabled={isUnlimited} // 무제한 체크 시 비활성화
                    sx={{ flex: 1 }}
                  />
                )}
              />
              <Controller
                name="is_unlimited"
                control={control}
                render={({ field }) => (
                  <FormControlLabel 
                    control={<Checkbox {...field} checked={field.value} />} 
                    label="무제한" 
                  />
                )}
              />
            </Box>

            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel 
                  control={<Checkbox {...field} checked={field.value} />} 
                  label="상품 활성화 (즉시 노출)" 
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>취소</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? '수정 완료' : '등록')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}