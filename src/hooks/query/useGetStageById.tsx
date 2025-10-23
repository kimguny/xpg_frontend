import { useQuery } from '@tanstack/react-query';
import { getAdminStageById } from '@/lib/api/admin';

export const useGetStageById = (stageId: string | undefined) => {
  return useQuery({
    queryKey: ['adminStage', stageId],
    queryFn: () => getAdminStageById(stageId!),
    enabled: !!stageId,
  });
};