import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminHint, HintCreatePayload } from '@/lib/api/admin';

export const useCreateHint = (stageId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HintCreatePayload) => createAdminHint({ stageId: stageId!, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStageById', stageId] });
    },
    onError: (err) => {
      alert(`힌트 생성 실패: ${err.message}`);
    },
  });
};