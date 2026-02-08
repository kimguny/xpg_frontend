import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminNotification } from '@/lib/api/admin';

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteAdminNotification(notificationId),
    onSuccess: () => {
      alert('공지사항이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
    onError: (err: Error) => {
      alert(`삭제 실패: ${err.message}`);
    },
  });
};