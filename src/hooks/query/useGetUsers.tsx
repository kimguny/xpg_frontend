import { useQuery } from '@tanstack/react-query';
import { getAdminUsers, GetUsersParams, PaginatedResponse, User } from '@/lib/api/admin';

export const useGetUsers = (params: GetUsersParams) => {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['adminUsers', params],
    queryFn: () => getAdminUsers(params),
  });
};