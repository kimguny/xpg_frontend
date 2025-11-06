import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminHint } from '@/lib/api/admin';

interface DeleteHintVariables {
  hintId: string;
  stageId?: string; // 힌트 목록 갱신을 위해 stageId가 필요
}

/**
 * 힌트를 삭제하는 useMutation 훅
 */
export const useDeleteHint = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteHintVariables>({
    mutationFn: ({ hintId }) => deleteAdminHint(hintId),
    
    onSuccess: (data, variables) => {
      alert('힌트가 삭제되었습니다.');
      // 힌트 삭제 성공 시, 부모 스테이지의 힌트 목록을 갱신
      if (variables.stageId) {
        queryClient.invalidateQueries({ queryKey: ['adminStageById', variables.stageId] });
        // (get_stages_by_content가 content_id를 사용하므로, 이 훅에서는 갱신이 어려울 수 있으나,
        // 부모 컴포넌트에서 adminStageById 쿼리를 다시 불러오면 데이터가 갱신됨)
      }
    },
    onError: (err) => {
      alert(`힌트 삭제 실패: ${err.message}`);
    },
  });
};