import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateAdminStage, StageUpdatePayload } from '@/lib/api/admin';

export const useUpdateStage = (contentId: string, stageId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: StageUpdatePayload) => updateAdminStage({ stageId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStages', contentId] });
      queryClient.invalidateQueries({ queryKey: ['adminStage', stageId] });
      router.push(`/save/content/stage/${contentId}`);
    },
    onError: (err) => {
      alert(`스테이지 수정 실패: ${err.message}`);
    },
  });
};