// src/hooks/mutation/useCreateNfcTag.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createAdminNfcTag, NFCTagCreatePayload } from '@/lib/api/admin';

export const useCreateNfcTag = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: NFCTagCreatePayload) => createAdminNfcTag(payload),
    onSuccess: () => {
      // 태그 생성 성공 시,
      // 1. NFC 목록 캐시를 무효화하여 목록 페이지가 갱신되도록 합니다.
      queryClient.invalidateQueries({ queryKey: ['adminNfcTags'] });
      alert('NFC 태그가 성공적으로 등록되었습니다.');
      // 2. NFC 관리 목록 페이지로 이동합니다.
      router.push('/save/nfc/manage');
    },
    onError: (err: Error) => {
      // (백엔드에서 409 Conflict (UDID 중복) 오류 등을 처리)
      alert(`태그 등록 실패: ${err.message}`);
    },
  });
};