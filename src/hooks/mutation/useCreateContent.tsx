import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createAdminContent, ContentCreatePayload } from '@/lib/api/admin';

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ContentCreatePayload) => createAdminContent(payload),
    onSuccess: () => {
      // 콘텐츠 생성 성공 시
      // 1. 'adminContents' 쿼리를 무효화하여 목록 페이지가 최신 데이터를 다시 불러오게 함
      queryClient.invalidateQueries({ queryKey: ['adminContents'] });
      // 2. 콘텐츠 관리 목록 페이지로 이동
      router.push('/save/content/manage');
    },
    onError: (error) => {
      console.error('콘텐츠 생성 실패:', error);
      alert('콘텐츠 생성에 실패했습니다.');
    },
  });
};