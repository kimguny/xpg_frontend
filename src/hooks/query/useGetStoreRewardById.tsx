// src/hooks/query/useGetStoreRewardById.tsx (수정된 버전)

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAdminStoreRewardById, StoreReward } from '@/lib/api/admin';

/**
 * [Admin] 특정 리워드 상품의 상세 정보를 조회하는 쿼리 훅
 * @param rewardId 조회할 리워드 ID (string, null, 또는 undefined)
 */
export const useGetStoreRewardById = (
  // 💡 단일 인수로 수정. enabled 로직은 훅 내부에서 처리합니다.
  rewardId: string | null | undefined
): UseQueryResult<StoreReward, Error> => {
  return useQuery({
    queryKey: ['adminStoreReward', rewardId],
    queryFn: () => {
      // rewardId가 null이면 API 호출 시 오류가 발생하므로, 유효성 검사 추가
      if (!rewardId) throw new Error('Reward ID is required for detailed query');
      return getAdminStoreRewardById(rewardId);
    },
    // 💡 rewardId가 있을 때만 쿼리를 활성화합니다. (두 번째 인수를 제거하고 enabled로 로직 이동)
    enabled: !!rewardId,
  });
};