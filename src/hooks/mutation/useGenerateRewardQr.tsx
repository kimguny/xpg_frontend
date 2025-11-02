// src/hooks/mutation/useGenerateRewardQr.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAdminRewardQrCode, GenerateQrResponse } from '@/lib/api/admin';

/**
 * [Admin] 리워드 상품 QR 코드를 생성하는 뮤테이션 훅
 * @returns QR 코드 생성 뮤테이션 함수
 */
export const useGenerateRewardQr = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateQrResponse, Error, string>({
    mutationFn: (rewardId: string) => generateAdminRewardQrCode(rewardId),
    
    onSuccess: (data, rewardId) => {
      alert(`QR 코드가 생성되었습니다. URL: ${data.qr_image_url}`);
      // QR 코드가 생성되면 해당 리워드 상품의 상세 캐시를 갱신할 수 있습니다.
      // (만약 QR 코드 URL을 reward 모델에 저장한다면)
      queryClient.invalidateQueries({ queryKey: ['adminStoreReward', rewardId] });
    },
    onError: (err: Error) => {
      alert(`QR 코드 생성 실패: ${err.message}`);
    },
  });
};