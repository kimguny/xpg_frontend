import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

export interface UserProfile {
  name?: string;
  phone?: string;
  points?: number;
}

// User 타입
export interface User {
  id: string;
  login_id: string;
  email: string | null;
  nickname: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  status: string;
  profile: UserProfile | null;
  created_at: string;
  last_active_at: string | null;
}

// 사용자 목록 조회 파라미터
export interface GetUsersParams {
  q?: string;
  status?: 'active' | 'blocked' | 'deleted';
  page?: number;
  size?: number;
  sort?: string;
}

export interface PointAdjustPayload {
  coin_delta: number;
  note: string;
}

export interface RewardHistoryItem {
  id: number;
  user_id: string;
  content_id: string | null;
  stage_id: string | null;
  coin_delta: number;
  created_at: string;
  note: string | null;
}

// MeResponse 타입
export interface MeResponse {
  id: string;
  login_id: string;
  email: string | null;
  nickname: string | null;
  profile_image_url: string | null;
  email_verified: boolean;
  status: string;
  profile: UserProfile | null; 
  points: number;
  created_at: string;
  last_active_at: string | null;
}

/**
 * 관리자용: 사용자 목록 조회
 */
export const getAdminUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
  return response.data;
};

/**
 * 관리자용: 사용자 삭제
 */
export const deleteAdminUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
};

/**
 * 관리자용: 포인트 수동 조정
 */
export const adjustAdminUserPoints = async ({
  userId,
  payload,
}: {
  userId: string;
  payload: PointAdjustPayload;
}): Promise<RewardHistoryItem> => {
  const response = await apiClient.post<RewardHistoryItem>(
    `/admin/users/${userId}/adjust-points`,
    payload
  );
  return response.data;
};

/**
 * 내 정보 조회 (GET /me)
 */
export const getMe = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>('/me');
  return response.data;
};