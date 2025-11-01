// src/hooks/mutation/useAdjustPoints.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustAdminUserPoints, PointAdjustPayload } from '@/lib/api/admin';

export const useAdjustPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: PointAdjustPayload }) =>
      adjustAdminUserPoints({ userId, payload }),
    
    onSuccess: (data, variables) => {
      // 포인트 조정 성공 시,
      // 1. 회원 목록 쿼리를 무효화하여 목록을 갱신합니다.
      // (주의: user.profile.points가 아닌 rewards_ledger 합계를 가져와야
      //  포인트가 실시간 갱신됩니다. 현재는 목록만 갱신됩니다.)
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      
      // 2. (선택적) 해당 유저의 상세 정보 쿼리도 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['adminUser', variables.userId] });

      alert('포인트가 성공적으로 조정되었습니다.');
    },
    onError: (err) => {
      alert(`포인트 조정 실패: ${err.message}`);
    },
  });
};