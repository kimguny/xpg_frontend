import { useQuery } from '@tanstack/react-query';
// [1. 수정] 'Stage' 타입을 import합니다. (이 타입은 admin.ts에 정의되어 있음)
import { getAdminStages, Stage } from '@/lib/api/admin';

export const useGetStages = (contentId: string) => {
  // [2. 수정] useQuery에 반환 타입 <Stage[]>을 명시합니다.
  return useQuery<Stage[]>({
    queryKey: ['adminStages', contentId],
    queryFn: () => getAdminStages(contentId),
    enabled: !!contentId, // contentId가 있을 때만 쿼리를 실행합니다.
  });
};