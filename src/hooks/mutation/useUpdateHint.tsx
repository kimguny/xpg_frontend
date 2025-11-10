import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  updateAdminHint, 
  HintUpdatePayload,
  Hint
} from '@/lib/api/admin';

/**
 * 힌트 수정을 위한 훅의 입력 변수 타입
 */
interface UpdateHintVariables {
  hintId: string;
  stageId: string; // 쿼리 무효화를 위해 stageId가 필요
  payload: HintUpdatePayload;
}

/**
 * 힌트를 수정하는 useMutation 훅
 */
export const useUpdateHint = () => {
  const queryClient = useQueryClient();

  return useMutation<Hint, Error, UpdateHintVariables>({
    mutationFn: ({ hintId, payload }) => updateAdminHint({ hintId, payload }),
    
    onSuccess: (data, variables) => {
      alert('힌트가 성공적으로 수정되었습니다.');
      
      // 힌트 수정 성공 시, 부모 스테이지의 상세 정보 쿼리를 무효화하여
      // 힌트 목록을 포함한 스테이지 전체 데이터를 새로고침합니다.
      if (variables.stageId) {
        queryClient.invalidateQueries({ queryKey: ['adminStageById', variables.stageId] });
      }
      
      // (만약 별도의 힌트 목록 쿼리를 사용한다면)
      // queryClient.invalidateQueries({ queryKey: ['adminHints', variables.stageId] });
    },
    onError: (err) => {
      alert(`힌트 수정 실패: ${err.message}`);
    },
  });
};