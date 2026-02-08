import { useQuery } from '@tanstack/react-query';
import { getAdminNotifications, GetNotificationsParams } from '@/lib/api/admin';

export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: ['adminNotifications', params],
    queryFn: () => getAdminNotifications(params),
  });
};