// src/hooks/mutation/useUpdateStoreReward.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  updateAdminStoreReward, 
  StoreRewardUpdatePayload, 
  StoreReward 
} from '@/lib/api/admin';

interface UpdateRewardPayload {
  rewardId: string;
  payload: StoreRewardUpdatePayload;
}

/**
 * [Admin] 리워드 상품 정보를 수정하는 뮤테이션 훅
 */
export const useUpdateStoreReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rewardId, payload }: UpdateRewardPayload) =>
      updateAdminStoreReward({ rewardId, payload }),
      
    onSuccess: (updatedReward: StoreReward) => {
      alert(`상품 '${updatedReward.product_name}'이 수정되었습니다.`);
      
      // 1. 상세 리워드 캐시 무효화 (수정 반영)
      queryClient.invalidateQueries({ queryKey: ['adminStoreReward', updatedReward.id] });
      // 2. 리워드 목록 캐시 무효화 (목록에 반영)
      queryClient.invalidateQueries({ queryKey: ['adminStoreRewards'] });
      // 3. 매장 상세 캐시 무효화 (해당 매장의 리워드 목록에 반영될 수 있음)
      queryClient.invalidateQueries({ queryKey: ['adminStore', updatedReward.store_id] }); 
    },
    onError: (err: Error) => {
      alert(`상품 수정 실패: ${err.message}`);
    },
  });
};