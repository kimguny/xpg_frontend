import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStagePuzzles, PuzzlePayload } from '@/lib/api/admin';

export const useUpdatePuzzles = (stageId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PuzzlePayload) => {
      if (!stageId) {
        return Promise.reject(new Error("Stage ID is not provided."));
      }
      return updateStagePuzzles({ stageId, payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStage', stageId] });
      alert('퍼즐 설정이 저장되었습니다.');
    },
    onError: (err) => {
      if (err instanceof Error) {
        alert(`퍼즐 설정 저장 실패: ${err.message}`);
      } else {
        alert('알 수 없는 오류로 퍼즐 설정 저장에 실패했습니다.');
      }
    },
  });
};