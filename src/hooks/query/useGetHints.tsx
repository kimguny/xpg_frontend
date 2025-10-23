import { useQuery } from '@tanstack/react-query';
import { getAdminHintsForStage } from '@/lib/api/admin';

export const useGetHints = (stageId: string | undefined) => {
  return useQuery({
    queryKey: ['adminHints', stageId],
    queryFn: () => getAdminHintsForStage(stageId!),
    enabled: !!stageId, // stageId가 있을 때만 쿼리를 실행
  });
};