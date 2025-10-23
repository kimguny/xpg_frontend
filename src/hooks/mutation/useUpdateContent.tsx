import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateAdminContent, ContentUpdatePayload } from '@/lib/api/admin';

export const useUpdateContent = (contentId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ContentUpdatePayload) => updateAdminContent({ contentId: contentId!, payload }),
    onSuccess: () => {
      // 관련 쿼리들을 무효화하여 최신 데이터로 업데이트합니다.
      queryClient.invalidateQueries({ queryKey: ['adminContents'] });
      queryClient.invalidateQueries({ queryKey: ['adminContent', contentId] });
      router.push('/save/content/manage');
    },
    onError: (err) => {
      alert(`수정 실패: ${err.message}`);
    },
  });
};