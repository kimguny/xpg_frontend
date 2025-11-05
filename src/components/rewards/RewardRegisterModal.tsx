'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react'; // [1. useRef, ChangeEvent 추가]
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
  CircularProgress,
  FormControl, Select, MenuItem, InputLabel,
} from '@mui/material';

// 훅 및 타입 임포트
import { useCreateStoreReward } from '@/hooks/mutation/useCreateStoreReward';
import { useUpdateStoreReward } from '@/hooks/mutation/useUpdateStoreReward';
import { useGetStoreRewardById } from '@/hooks/query/useGetStoreRewardById';
import { StoreRewardCreatePayload, StoreRewardUpdatePayload } from '@/lib/api/admin';
import { useGenerateRewardQr } from '@/hooks/mutation/useGenerateRewardQr'; 
import { useUploadImage } from '@/hooks/mutation/useUploadImage';

// 1. Props 인터페이스
interface RewardRegisterModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'register' | 'edit';
  storeId?: string; 
  rewardId?: string | null; 
}

// 2. 폼 데이터 타입
type RewardFormData = {
  product_name: string;
  product_desc: string;
  image_url: string;
  price_coin: string;
  stock_qty: string;
  is_unlimited: boolean; 
  is_active: boolean;
  exposure_order: string; 
  category: string; 
};

// 폼의 명시적인 기본값 상수
const DEFAULT_FORM_VALUES: RewardFormData = {
  product_name: '', product_desc: '', image_url: '',
  price_coin: '0', stock_qty: '100',
  is_unlimited: false, is_active: true,
  exposure_order: '0', 
  category: '기타', 
};

// 카테고리 옵션
const CATEGORY_OPTIONS = ['식품', '굿즈', '상품권', '쿠폰', '기타'];
// [3. 추가] 백엔드 API 주소 (환경변수에서 가져오는 것이 가장 좋음)
const API_BASE_URL = 'http://121.126.223.205:8000'; 

export default function RewardRegisterModal({ open, onClose, mode, storeId, rewardId }: RewardRegisterModalProps) {
  
  const isEditMode = mode === 'edit' && !!rewardId;

  // [4. 추가] 파일 입력을 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validStoreId = storeId || ''; 
  const createRewardMutation = useCreateStoreReward(validStoreId);
  const updateRewardMutation = useUpdateStoreReward(); 
  const generateQrMutation = useGenerateRewardQr(); 
  const uploadImageMutation = useUploadImage();

  const { data: initialData, isLoading: isDataLoading } = useGetStoreRewardById(
    isEditMode ? rewardId : null
  );
  
  const [isQrGenerated, setIsQrGenerated] = useState(false); 
  const [qrDownloadUrl, setQrDownloadUrl] = useState<string | null>(null);
  // [6. 추가] 업로드할 파일명 상태
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<RewardFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const isUnlimited = watch('is_unlimited');

  // 재고 무제한 체크 시 수량 필드 처리 로직
  useEffect(() => {
    if (isUnlimited) {
      setValue('stock_qty', '', { shouldValidate: true });
    } else if (!isUnlimited && watch('stock_qty') === '') {
        setValue('stock_qty', '0');
    }
  }, [isUnlimited, setValue, watch]);


  // 폼 초기화 로직
  useEffect(() => {
    if (!open) {
      reset(DEFAULT_FORM_VALUES);
      setIsQrGenerated(false); 
      setQrDownloadUrl(null); // URL 초기화
      setSelectedFileName(null); // 파일명 초기화
    } else if (open && isEditMode && initialData) {
        reset({
            product_name: initialData.product_name,
            product_desc: initialData.product_desc || '',
            image_url: initialData.image_url || '',
            price_coin: String(initialData.price_coin),
            stock_qty: initialData.stock_qty === null ? '' : String(initialData.stock_qty),
            is_unlimited: initialData.stock_qty === null,
            is_active: initialData.is_active,
            exposure_order: String(initialData.exposure_order || 0), 
            category: initialData.category || '기타',
        });
        
        // DB에 저장된 qr_image_url이 있는지 확인
        if (initialData.qr_image_url) {
            // URL이 있으면, 다운로드 URL 상태에 저장하고 버튼 활성화
            setQrDownloadUrl(initialData.qr_image_url);
            setIsQrGenerated(true);
        } else {
            // URL이 없으면, 비활성화
            setQrDownloadUrl(null);
            setIsQrGenerated(false);
        }
    }
  }, [open, isEditMode, initialData, reset]);


  // 폼 제출(상품 등록/수정) 핸들러
  const onSubmit: SubmitHandler<RewardFormData> = (data) => {
    
    // API Payload 변환 로직
    const payload = {
      product_name: data.product_name,
      product_desc: data.product_desc || null,
      image_url: data.image_url || null, // 파일 업로드 성공 시 이 URL을 덮어써야 함
      price_coin: Number(data.price_coin) || 0,
      stock_qty: data.is_unlimited ? null : (data.stock_qty ? Number(data.stock_qty) : 0), 
      is_active: data.is_active,
      exposure_order: Number(data.exposure_order) || 0,
      category: data.category,
    };
    
    if (isEditMode && rewardId) {
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
      createRewardMutation.mutate(payload as StoreRewardCreatePayload, {
        onSuccess: () => {
          onClose(); 
        },
        onError: (err) => alert(`상품 등록 실패: ${err.message}`),
      });
    }
  };
  
  // QR 코드 생성 핸들러 (API 연동)
  const handleGenerateQrCode = () => {
      if (!isEditMode || !rewardId) {
          alert("상품을 먼저 등록(저장)해야 QR 코드를 생성할 수 있습니다.");
          return;
      }

      generateQrMutation.mutate(rewardId, {
          onSuccess: (data) => {
              setQrDownloadUrl(data.qr_image_url); // 예: '/media/qr/file.png'
              setIsQrGenerated(true); 
              alert('QR 코드가 성공적으로 생성되었습니다.');
          },
          onError: (err) => {
              alert(`QR 코드 생성 실패: ${err.message}`);
              setIsQrGenerated(false);
          }
      });
  };

  // [7. 수정] QR 코드 다운로드 핸들러 (404 해결)
  const handleDownloadQrCode = () => {
      if (!qrDownloadUrl) {
          alert('QR 코드가 아직 생성되지 않았거나 URL이 유효하지 않습니다.');
          return;
      }
      
      // 상대 경로를 절대 URL로 변환
      // qrDownloadUrl이 '/media/...'로 시작한다고 가정
      const fullUrl = `${API_BASE_URL}${qrDownloadUrl}`;
      window.open(fullUrl, '_blank');
  };

  // [8. 추가] 파일 선택 버튼 클릭 핸들러
  const handleSelectFileClick = () => {
      fileInputRef.current?.click();
  };

  // [9. 추가] 파일 선택 시 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFileName(file.name);

      const formData = new FormData();
      formData.append('file', file); // 백엔드 API의 파라미터 이름('file')과 일치

      uploadImageMutation.mutate(formData, {
          onSuccess: (data) => {
              // 업로드 성공 시, 반환된 URL을 폼의 image_url 필드에 세팅
              // data.file_path 예: /media/images/uuid.png
              setValue('image_url', data.file_path, { shouldValidate: true }); 
              alert('이미지가 업로드되어 URL에 반영되었습니다.');
              setSelectedFileName(null); // 성공 후 파일명 초기화
          },
          onError: (err) => {
              alert(`이미지 업로드 실패: ${err.message}`);
              setSelectedFileName(null);
          }
      });
      
      // 파일 입력 초기화 (동일한 파일 다시 선택 가능하도록)
      e.target.value = '';
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
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            <Controller
              name="product_name"
              control={control}
              rules={{ required: '상품명은 필수입니다.' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="상품명" fullWidth required error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            
            <Controller
              name="product_desc"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="설명" placeholder="상품 설명 및 사이즈 등" multiline rows={3} fullWidth />
              )}
            />

            <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>제품 이미지 등록</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                     {/* [10. 수정] 파일 선택 버튼에 핸들러 연결 */}
                     <Button 
                        variant="contained" 
                        disableElevation 
                        size="small"
                        onClick={handleSelectFileClick}
                        // disabled={uploadImageMutation.isPending} // API 연동 시
                     >
                        파일 선택
                     </Button>
                     <Typography variant="caption" color="text.secondary">
                        {/* [11. 추가] 선택된 파일명 표시 */}
                        {selectedFileName ? selectedFileName : "* 이미지 사이즈는 800x800 이하 권장."}
                     </Typography>
                </Box>
                {/* [12. 추가] 숨겨진 파일 input */}
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
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="이미지 URL (파일 업로드 시 자동 완성)" 
                        fullWidth 
                        size="small" 
                        sx={{ mt: 1 }} 
                        // [13. 추가] 파일 업로드 중에는 수동 입력 방지
                        // disabled={uploadImageMutation.isPending} 
                      />
                    )}
                  />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel id="category-label">카테고리</InputLabel>
                          <Select labelId="category-label" label="카테고리" {...field} value={field.value || CATEGORY_OPTIONS[0]}>
                            {CATEGORY_OPTIONS.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Controller
                      name="exposure_order"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="노출 우선순위" type="number" fullWidth InputProps={{ inputProps: { min: 0 } }} />
                      )}
                    />
                </Box>
            </Box>

            <Controller
              name="price_coin"
              control={control}
              rules={{ required: '필수, 반드시 입력' }}
              render={({ field, fieldState }) => (
                <TextField 
                  label="개당 포인트" 
                  type="number" 
                  placeholder="예: 3000" 
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  value={field.value}
                />
              )}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Controller
                    name="stock_qty"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        label="제공 상품 수 (재고)" 
                        type="number" 
                        placeholder="예: 10" 
                        disabled={isUnlimited}
                        sx={{ flex: 1 }}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        value={field.value}
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
                        sx={{ ml: 2 }}
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
            
            <Box>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>상품 QR 코드 생성</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button 
                        variant="outlined" 
                        onClick={handleGenerateQrCode} 
                        disabled={!isEditMode || generateQrMutation.isPending} 
                        sx={{ flex: 1 }}
                    >
                        {generateQrMutation.isPending ? '생성 중...' : (isQrGenerated ? '재생성' : '교환처 QR 코드 생성')}
                    </Button>
                    <Button 
                        variant="contained" 
                        color="success" 
                        disabled={!isQrGenerated || !qrDownloadUrl} 
                        sx={{ flex: 1 }}
                        onClick={handleDownloadQrCode} 
                    >
                        QR 코드 다운로드
                    </Button>
                </Box>
                <Typography variant="caption" color={isEditMode ? "error" : "text.secondary"} sx={{ mt: 1 }}>
                    {isEditMode ? 
                        (isQrGenerated ? "QR 코드가 생성되었습니다. 다운로드하세요." : "* 등록된 상품의 QR 코드를 생성해야 합니다.") : 
                        "* 상품 등록(저장) 후 수정 모드에서 QR 코드를 생성할 수 있습니다."
                    }
                </Typography>
            </Box>
            
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

