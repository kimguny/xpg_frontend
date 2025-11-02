// src/hooks/query/useGetStoreRewards.tsx (수정된 버전)

import { 
  useQuery, 
  UseQueryResult, 
  keepPreviousData, 
} from '@tanstack/react-query';
import { 
  getAdminStoreRewards, 
  PaginatedResponse, 
  StoreReward,
  GetStoreRewardsParams // 원본 타입을 직접 임포트하여 사용
} from '@/lib/api/admin';

// 🚨 오류를 발생시키던 빈 인터페이스 StoreRewardsQuery를 제거합니다.

/**
 * [Admin] 리워드 상품 목록을 조회하는 쿼리 훅 (페이지네이션, 검색, 필터링 지원)
 * @param params 검색, 필터링, 페이징 파라미터 (GetStoreRewardsParams 타입 사용)
 * @returns 리워드 목록 및 쿼리 상태 (isLoading, data 등)
 */
export const useGetStoreRewards = (
  params: GetStoreRewardsParams // 💡 원본 타입(GetStoreRewardsParams)을 직접 사용
): UseQueryResult<PaginatedResponse<StoreReward>, Error> => {
  return useQuery({
    queryKey: ['adminStoreRewards', params], 
    queryFn: () => getAdminStoreRewards(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, 
  });
};