// src/hooks/query/useGetNfcTags.tsx

import { useQuery } from '@tanstack/react-query';
import {
  getAdminNfcTags,
  GetNfcTagsParams,
  PaginatedResponse,
  NfcTag,
} from '@/lib/api/admin';

export const useGetNfcTags = (params: GetNfcTagsParams) => {
  return useQuery<PaginatedResponse<NfcTag>>({
    // 파라미터가 바뀔 때마다 쿼리를 다시 실행
    queryKey: ['adminNfcTags', params],
    queryFn: () => getAdminNfcTags(params),
  });
};