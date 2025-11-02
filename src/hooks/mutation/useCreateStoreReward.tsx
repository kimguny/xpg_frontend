// src/hooks/mutation/useCreateStoreReward.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminStoreReward, StoreRewardCreatePayload } from '@/lib/api/admin';

export const useCreateStoreReward = (storeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreRewardCreatePayload) =>
      createAdminStoreReward({ storeId, payload }),
    
    onSuccess: () => {
      alert('새 상품(리워드)이 등록되었습니다.');
      // 1. 이 매장의 상세 정보 캐시를 무효화 (상품 목록 갱신)
      queryClient.invalidateQueries({ queryKey: ['adminStore', storeId] });
      // 2. 전체 매장 목록 캐시도 무효화 (상품 개수 갱신)
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
    onError: (err: Error) => {
      alert(`상품 등록 실패: ${err.message}`);
    },
  });
};