import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

// 결제/적립 내역 아이템 타입
export interface RewardLedgerItem {
  id: number;
  created_at: string;
  coin_delta: number;
  note: string | null;
  user: {
    id: string;
    login_id: string;
    nickname: string | null;
  } | null;
  reward: {
    id: string;
    product_name: string;
  } | null;
  content: {
    id: string;
    title: string;
  } | null;
  stage: {
    id: string;
    title: string;
  } | null;
}

// 내역 조회 파라미터
export interface GetRewardLedgerParams {
  page?: number;
  size?: number;
  sort?: string;
  user_id?: string;
  q?: string;
}

/**
 * 관리자용: 포인트 결제 및 적립 내역(Ledger) 조회
 */
export const getAdminRewardLedger = async (
  params: GetRewardLedgerParams = {}
): Promise<PaginatedResponse<RewardLedgerItem>> => {
  const response = await apiClient.get<PaginatedResponse<RewardLedgerItem>>(
    '/admin/reward-ledger',
    { params }
  );
  return response.data;
};