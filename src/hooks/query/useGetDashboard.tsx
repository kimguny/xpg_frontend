import { useQuery } from '@tanstack/react-query';
import { getAdminUsers, getAdminContents, getAdminNfcTags } from '@/lib/api/admin';

/**
 * A custom hook to fetch all necessary data for the admin dashboard.
 */
export function useGetDashboardData() {
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsers,
  });

  const { data: contentsData, isLoading: isContentsLoading } = useQuery({
    queryKey: ['adminContents'],
    queryFn: getAdminContents,
  });

  const { data: nfcTagsData, isLoading: isNfcTagsLoading } = useQuery({
    queryKey: ['adminNfcTags'],
    queryFn: getAdminNfcTags,
  });

  return {
    usersData,
    isUsersLoading,
    contentsData,
    isContentsLoading,
    nfcTagsData,
    isNfcTagsLoading,
  };
}