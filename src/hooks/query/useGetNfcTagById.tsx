// src/hooks/query/useGetNfcTagById.tsx

import { useQuery } from '@tanstack/react-query';
import { getAdminNfcTagById, NfcTag } from '@/lib/api/admin';

export const useGetNfcTagById = (nfcId: string | undefined) => {
  return useQuery<NfcTag>({
    // nfcId가 있을 때만 쿼리를 실행합니다.
    queryKey: ['adminNfcTag', nfcId],
    queryFn: () => getAdminNfcTagById(nfcId!),
    enabled: !!nfcId,
  });
};