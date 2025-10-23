import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUnlockConfig, UnlockConfigPayload } from '@/lib/api/admin';

export const useUpdateUnlock = (stageId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnlockConfigPayload) => {
      if (!stageId) {
        return Promise.reject(new Error("Stage ID is not provided."));
      }
      return updateUnlockConfig({ stageId, payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStage', stageId] });
      alert('해금 설정이 저장되었습니다.');
    },
    onError: (err) => {
      if (err instanceof Error) {
        alert(`해금 설정 저장 실패: ${err.message}`);
      }
    },
  });
};