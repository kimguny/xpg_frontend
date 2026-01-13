import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetAllUserPoints } from '@/lib/api/admin';

export const useResetAllPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => resetAllUserPoints(password),
    onSuccess: () => {
      // 포인트가 모두 변경되었으므로 'users' 관련 쿼리 데이터를 무효화하여 목록을 새로고침합니다.
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: unknown) => {
      // 에러 처리는 컴포넌트 레벨에서 하거나 여기서 공통 알림을 띄울 수 있습니다.
      console.error('전체 포인트 리셋 실패:', error);
    },
  });
};