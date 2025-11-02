// src/hooks/mutation/useGenerateRewardQr.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAdminRewardQrCode, GenerateQrResponse } from '@/lib/api/admin';

export const useGenerateRewardQr = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateQrResponse, Error, string>({
    mutationFn: (rewardId: string) => generateAdminRewardQrCode(rewardId),
    
    onSuccess: (data, rewardId) => {
      queryClient.invalidateQueries({ queryKey: ['adminStoreReward', rewardId] });
    },
    onError: (err: Error) => {
      alert(`QR 코드 생성 실패: ${err.message}`);
    },
  });
};