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
      
      // 상품 삭제 후 관련 목록 쿼리 캐시를 무효화하여 UI를 갱신합니다.
      
      // 1. 전체 리워드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['adminStoreRewards'] });
      
      // 2. 삭제된 상품 상세 캐시 제거
      queryClient.removeQueries({ queryKey: ['adminStoreReward', rewardId] });
      
      // TODO: 삭제된 상품이 속했던 매장의 상세 정보 캐시 무효화 (상품 개수 등이 갱신될 수 있음)
      // 매장 ID를 알 수 없으므로, 모든 매장 쿼리를 무효화하거나, 이 API 응답에 store_id를 포함하도록 백엔드 수정 필요
      // 일단은 상품 목록만 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
    onError: (err: Error) => {
      alert(`상품 삭제 실패: ${err.message}`);
    },
  });
};