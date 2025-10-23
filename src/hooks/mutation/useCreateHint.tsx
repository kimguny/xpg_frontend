import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminHint, HintCreatePayload } from '@/lib/api/admin';

export const useCreateHint = (stageId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HintCreatePayload) => createAdminHint({ stageId: stageId!, payload }),
    onSuccess: () => {
      // 힌트 생성 성공 시, 해당 스테이지의 힌트 목록 쿼리를 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['adminHints', stageId] });
    },
    onError: (err) => {
      alert(`힌트 생성 실패: ${err.message}`);
    },
  });
};