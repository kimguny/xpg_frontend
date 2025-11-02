import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from '@/lib/api/admin';

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminDashboardStats,
  });
};

