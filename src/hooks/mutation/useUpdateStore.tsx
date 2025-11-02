// src/hooks/mutation/useUpdateStore.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateAdminStore, StoreUpdatePayload } from '@/lib/api/admin';

export const useUpdateStore = (storeId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: StoreUpdatePayload) =>
      updateAdminStore({ storeId, payload }),
    
    onSuccess: () => {
      alert('매장 정보가 성공적으로 수정되었습니다.');
      // 목록 캐시와 상세 캐시를 모두 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStore', storeId] });
      // 관리 목록 페이지로 이동합니다.
      router.push('/save/stores/manage');
    },
    onError: (err: Error) => {
      alert(`매장 수정 실패: ${err.message}`);
    },
  });
};