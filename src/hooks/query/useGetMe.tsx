import { useQuery } from '@tanstack/react-query';
import { getMe, MeResponse } from '@/lib/api/admin';

// 쿼리 키 상수 (예: src/constants/queryKeys.ts)
export const QUERY_KEYS = {
  ME: 'me',
};

/**
 * 현재 로그인된 사용자 정보 (GET /api/v1/me)를 조회하는 훅
 */
export const useGetMe = () => {
  return useQuery<MeResponse, Error>({
    queryKey: [QUERY_KEYS.ME],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    retry: false, // 인증 실패 시(401/403) 재시도 안 함
  });
};

