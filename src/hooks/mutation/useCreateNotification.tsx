import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createAdminNotification, NotificationCreatePayload } from '@/lib/api/admin';

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: NotificationCreatePayload) => createAdminNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      alert('공지사항이 성공적으로 등록되었습니다.');
      router.push('/save/notifications/manage');
    },
    onError: (err: Error) => {
      alert(`공지사항 등록 실패: ${err.message}`);
    },
  });
};