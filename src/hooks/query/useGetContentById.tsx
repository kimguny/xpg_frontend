import { useQuery } from '@tanstack/react-query';
import { getAdminContentById } from '@/lib/api/admin';

export const useGetContentById = (contentId: string | undefined) => {
  return useQuery({
    queryKey: ['adminContent', contentId],
    queryFn: () => getAdminContentById(contentId!),
    enabled: !!contentId, // contentId가 있을 때만 쿼리를 실행합니다.
  });
};