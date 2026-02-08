import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateAdminNotification, NotificationUpdatePayload } from '@/lib/api/admin';

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ notificationId, payload }: { notificationId: string; payload: NotificationUpdatePayload }) =>
      updateAdminNotification({ notificationId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotification'] });
      alert('공지사항이 성공적으로 수정되었습니다.');
      router.push('/save/notifications/manage');
    },
    onError: (err: Error) => {
      alert(`공지사항 수정 실패: ${err.message}`);
    },
  });
};