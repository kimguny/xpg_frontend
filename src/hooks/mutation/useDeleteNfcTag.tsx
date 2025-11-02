// src/hooks/mutation/useDeleteNfcTag.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminNfcTag } from '@/lib/api/admin';

export const useDeleteNfcTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nfcId: string) => deleteAdminNfcTag(nfcId),
    onSuccess: () => {
      alert('NFC 태그가 삭제되었습니다.');
      // 삭제 성공 시, NFC 목록 캐시를 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['adminNfcTags'] });
    },
    onError: (err: Error) => {
      // (예: 힌트에 연결되어 400 오류가 뜬 경우)
      alert(`삭제 실패: ${err.message}`);
    },
  });
};