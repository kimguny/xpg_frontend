// src/hooks/query/useGetStoreById.tsx

import { useQuery } from '@tanstack/react-query';
import { getAdminStoreById, Store } from '@/lib/api/admin';

export const useGetStoreById = (storeId: string | undefined) => {
  return useQuery<Store>({
    // storeId가 있을 때만 쿼리를 실행합니다.
    queryKey: ['adminStore', storeId],
    queryFn: () => getAdminStoreById(storeId!),
    enabled: !!storeId,
  });
};