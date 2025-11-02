import { useQuery } from '@tanstack/react-query';
import {
  getAdminRewardLedger,
  GetRewardLedgerParams,
} from '@/lib/api/admin';

export const useGetRewardLedger = (params: GetRewardLedgerParams) => {
  return useQuery({
    queryKey: ['adminRewardLedger', params],
    queryFn: () => getAdminRewardLedger(params),
  });
};

