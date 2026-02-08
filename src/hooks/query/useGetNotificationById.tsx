import { useQuery } from '@tanstack/react-query';
import { getAdminNotificationById } from '@/lib/api/admin';

export const useGetNotificationById = (notificationId: string) => {
  return useQuery({
    queryKey: ['adminNotification', notificationId],
    queryFn: () => getAdminNotificationById(notificationId),
    enabled: !!notificationId,
  });
};