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
} from '@mui/material';
import { useCreateStoreReward } from '@/hooks/mutation/useCreateStoreReward';
import { StoreRewardCreatePayload } from '@/lib/api/admin';

// 1. [수정] Props 인터페이스: storeId를 받도록 함
interface RewardRegisterModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'register' | 'edit';
  storeId: string | undefined; // 상품이 속할 매장의 ID
}

// 2. [추가] 폼 데이터 타입 (UI 스크린샷 및 스키마 기반)
type RewardFormData = {
  product_name: string;
  product_desc: string;
  image_url: string;
  price_coin: string;
  stock_qty: string;
  is_unlimited: boolean; // 재고 무제한 체크박스용
  is_active: boolean;
};

export default function RewardRegisterModal({ open, onClose, mode, storeId }: RewardRegisterModalProps) {
  
  // 3. [추가] react-hook-form 및 API 훅 초기화
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

  const createRewardMutation = useCreateStoreReward(storeId!);
  const isUnlimited = watch('is_unlimited');

  // 4. [추가] 재고 무제한 체크 시 수량 필드 비활성화
  useEffect(() => {
    if (isUnlimited) {
      setValue('stock_qty', '');
    }
  }, [isUnlimited, setValue]);

  // 5. [추가] 모달이 닫힐 때 폼 리셋
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // 6. [추가] 폼 제출(상품 등록) 핸들러
  const onSubmit: SubmitHandler<RewardFormData> = (data) => {
    if (!storeId) {
      alert('매장 ID가 없어 상품을 등록할 수 없습니다.');
      return;
    }

    const payload: StoreRewardCreatePayload = {
      product_name: data.product_name,
      product_desc: data.product_desc || null,
      image_url: data.image_url || null,
      price_coin: Number(data.price_coin) || 0,
      stock_qty: data.is_unlimited ? null : (Number(data.stock_qty) || 0), // 무제한이면 null
      is_active: data.is_active,
    };

    createRewardMutation.mutate(payload, {
      onSuccess: () => {
        onClose(); // 성공 시 모달 닫기
      }
    });
  };

  const isLoading = createRewardMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {mode === 'register' ? '상품 등록' : '상품 수정'}
      </DialogTitle>
      
      {/* 7. [수정] <form> 태그와 onSubmit 핸들러 연결 */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            {/* [수정] '매장 선택' 제거 (storeId prop으로 받음) */}
            
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
                />
              )}
            />

            {/* (참고: UI의 '카테고리'는 DB 스키마에 없습니다. 우선 제외) */}
            
            <Controller
              name="image_url"
              control={control}
              render={({ field }) => (
                <TextField 
                  {...field} 
                  label="제품 이미지 URL" 
                  placeholder="https://" 
                />
              )}
            />
            {/* (파일 선택 버튼은 별도 업로드 API 구현 필요) */}

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
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? '저장 중...' : (mode === 'register' ? '등록' : '수정')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}