import { useQuery } from '@tanstack/react-query';
import { getAdminStages } from '@/lib/api/admin';

export const useGetStages = (contentId: string) => {
  return useQuery({
    // 쿼리 키에 contentId를 포함하여, 콘텐츠별로 캐시를 관리합니다.
    queryKey: ['adminStages', contentId],
    queryFn: () => getAdminStages(contentId),
    enabled: !!contentId, // contentId가 있을 때만 쿼리를 실행합니다.
  });
};