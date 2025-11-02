// src/hooks/query/useGetStores.tsx

import { useQuery } from '@tanstack/react-query';
import { getAdminStores, GetStoresParams, Store } from '@/lib/api/admin';

export const useGetStores = (params: GetStoresParams = {}) => {
  return useQuery<Store[]>({
    queryKey: ['adminStores', params],
    queryFn: () => getAdminStores(params),
  });
};