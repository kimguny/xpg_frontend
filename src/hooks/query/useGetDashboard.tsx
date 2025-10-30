import { useQuery } from '@tanstack/react-query';
import {
  getAdminUsers,
  getAdminContents,
  getAdminNfcTags,
  PaginatedResponse,
  User,
  Content,
  NfcTag
} from '@/lib/api/admin';
// (참고: User, Content, NfcTag 타입은 admin.ts 또는 types/api.ts 등에서 가져와야 합니다.)

/**
 * A custom hook to fetch all necessary data for the admin dashboard.
 */
export function useGetDashboardData() {
  // 1. useQuery에 <PaginatedResponse<User>> 타입을 명시합니다.
  const { data: usersData, isLoading: isUsersLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['adminUsers'],
    // 2. queryFn을 화살표 함수로 래핑합니다.
    queryFn: () => getAdminUsers(),
  });

  // 3. (동일) useQuery에 타입을 명시합니다.
  const { data: contentsData, isLoading: isContentsLoading } = useQuery<PaginatedResponse<Content>>({
    queryKey: ['adminContents'],
    // 4. (동일) queryFn을 화살표 함수로 래핑합니다.
    queryFn: () => getAdminContents(),
  });

  // 5. (동일) useQuery에 타입을 명시합니다.
  const { data: nfcTagsData, isLoading: isNfcTagsLoading } = useQuery<PaginatedResponse<NfcTag>>({
    queryKey: ['adminNfcTags'],
    // 6. (동일) queryFn을 화살표 함수로 래핑합니다.
    queryFn: () => getAdminNfcTags(),
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