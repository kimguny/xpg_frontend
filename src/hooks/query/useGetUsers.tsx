import { useQuery } from '@tanstack/react-query';
import { getAdminUsers, GetUsersParams } from '@/lib/api/admin';

export const useGetUsers = (params: GetUsersParams) => {
  return useQuery({
    // params가 변경될 때마다 쿼리를 다시 실행합니다.
    queryKey: ['adminUsers', params],
    queryFn: () => getAdminUsers(params),
  });
};