// src/hooks/mutation/useUpdateNfcTag.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateAdminNfcTag, NFCTagUpdatePayload } from '@/lib/api/admin';

export const useUpdateNfcTag = (nfcId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: NFCTagUpdatePayload) =>
      updateAdminNfcTag({ nfcId, payload }),
    
    onSuccess: () => {
      alert('NFC 태그가 성공적으로 수정되었습니다.');
      // 목록 캐시와 상세 캐시를 모두 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['adminNfcTags'] });
      queryClient.invalidateQueries({ queryKey: ['adminNfcTag', nfcId] });
      // 관리 목록 페이지로 이동합니다.
      router.push('/save/nfc/manage');
    },
    onError: (err: Error) => {
      alert(`태그 수정 실패: ${err.message}`);
    },
  });
};