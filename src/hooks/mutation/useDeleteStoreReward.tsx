// src/hooks/mutation/useDeleteStoreReward.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminStoreReward } from '@/lib/api/admin';

/**
 * [Admin] 리워드 상품을 삭제하는 뮤테이션 훅
 * @returns 상품 삭제 뮤테이션 함수
 */
export const useDeleteStoreReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn은 rewardId를 받아 API 호출
    mutationFn: (rewardId: string) => deleteAdminStoreReward(rewardId),
    
    onSuccess: (_, rewardId) => {
      alert('상품이 성공적으로 삭제되었습니다.');
      
      queryClient.invalidateQueries({ queryKey: ['adminStoreRewards'] });
      queryClient.removeQueries({ queryKey: ['adminStoreReward', rewardId] });
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
    onError: (err: Error) => {
      alert(`상품 삭제 실패: ${err.message}`);
    },
  });
};