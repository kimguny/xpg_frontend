import { useQuery } from '@tanstack/react-query';
import { getAdminHomeDashboard, HomeDashboardResponse } from '@/lib/api/admin';

export const useGetHomeDashboardData = () => {
  return useQuery<HomeDashboardResponse, Error>({
    queryKey: ['homeDashboardData'],
    queryFn: getAdminHomeDashboard,
    staleTime: 1000 * 60 * 3,
  });
};

