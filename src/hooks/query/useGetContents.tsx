import { useQuery } from '@tanstack/react-query';
import { getAdminContents } from '@/lib/api/admin';

/**
 * 관리자용 콘텐츠 목록을 가져오는 useQuery 훅
 */
export const useGetContents = () => {
  return useQuery({
    queryKey: ['adminContents'],
    queryFn: getAdminContents,
  });
};