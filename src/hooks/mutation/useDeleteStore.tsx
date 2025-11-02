// src/hooks/mutation/useDeleteStore.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminStore } from '@/lib/api/admin';

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => deleteAdminStore(storeId),
    onSuccess: () => {
      alert('매장이 삭제되었습니다.');
      // 매장 목록 캐시를 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
    },
    onError: (err: Error) => {
      alert(`삭제 실패: ${err.message}`);
    },
  });
};