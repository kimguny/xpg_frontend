import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createAdminStage, StageCreatePayload } from '@/lib/api/admin';

export const useCreateStage = (contentId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: StageCreatePayload) => createAdminStage({ contentId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStages', contentId] });
      router.push(`/save/content/stage/${contentId}`);
    },
    onError: (err) => {
      alert(`스테이지 생성 실패: ${err.message}`);
    },
  });
};