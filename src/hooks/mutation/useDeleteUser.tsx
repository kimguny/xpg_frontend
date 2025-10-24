import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminUser } from '@/lib/api/admin';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      // 사용자 삭제 성공 시, 사용자 목록 쿼리를 무효화하여 새로고침합니다.
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('사용자가 삭제되었습니다.');
    },
    onError: (err) => {
      alert(`사용자 삭제 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
    },
  });
};