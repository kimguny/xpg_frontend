// src/hooks/mutation/useCreateStore.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createAdminStore, StoreCreatePayload } from '@/lib/api/admin';

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: StoreCreatePayload) => createAdminStore(payload),
    onSuccess: () => {
      // 1. 매장 생성 성공 시, 매장 목록 캐시를 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      alert('매장이 성공적으로 등록되었습니다.');
      // 2. 매장 관리 목록 페이지로 이동합니다.
      router.push('/save/stores/manage');
    },
    onError: (err: Error) => {
      alert(`매장 등록 실패: ${err.message}`);
    },
  });
};