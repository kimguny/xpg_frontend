import apiClient from '@/utils/apiClient';

// openapi.json을 기반으로 한 전체 응답 타입 정의
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// User 타입 (UserResponse 스키마 기준)
export interface User {
  id: string;
  login_id: string;
  email: string | null;
  nickname: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  status: string;
  profile: object | null;
  created_at: string;
  last_active_at: string | null;
}

// Content 타입 (ContentResponse 스키마 기준)
export interface Content {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  exposure_slot: string;
  is_always_on: boolean;
  reward_coin: number;
  center_point: { lon: number; lat: number } | null;
  start_at: string | null;
  end_at: string | null;
  stage_count: number | null;
  is_sequential: boolean;
  has_next_content: boolean;
  next_content_id: string | null;
  created_at: string;
  is_open: boolean;
}

// NfcTag 타입 (NFCTagResponse 스키마 기준)
export interface NfcTag {
  id: string;
  udid: string;
  tag_name: string;
  address: string | null;
  floor_location: string | null;
  media_url: string | null;
  link_url: string | null;
  latitude: number | null;
  longitude: number | null;
  tap_message: string | null;
  point_reward: number;
  cooldown_sec: number;
  use_limit: number | null;
  is_active: boolean;
  category: string | null;
}

/**
 * 관리자용: 전체 사용자 목록을 가져옵니다. (GET /admin/users)
 */
export const getAdminUsers = async (): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('/admin/users');
  return response.data;
};

/**
 * 관리자용: 전체 콘텐츠 목록을 가져옵니다. (GET /admin/contents)
 */
export const getAdminContents = async (): Promise<PaginatedResponse<Content>> => {
  const response = await apiClient.get<PaginatedResponse<Content>>('/admin/contents', {
    params: { page: 1, size: 100 }, // 페이지네이션 기능 추가 전까지 100개 조회
  });
  return response.data;
};

/**
 * 관리자용: 전체 NFC 태그 목록을 가져옵니다. (GET /admin/nfc-tags)
 */
export const getAdminNfcTags = async (): Promise<PaginatedResponse<NfcTag>> => {
  const response = await apiClient.get<PaginatedResponse<NfcTag>>('/admin/nfc-tags');
  return response.data;
};

/**
 * 관리자용: 콘텐츠 삭제 (DELETE /admin/contents/{contentId})
 */
export const deleteAdminContent = async (contentId: string): Promise<void> => {
  await apiClient.delete(`/admin/contents/${contentId}`);
};

/**
 * 관리자용: 콘텐츠 상태 토글 (PATCH /admin/contents/{contentId}/toggle-open)
 */
export const toggleContentStatus = async (contentId: string): Promise<void> => {
  await apiClient.patch(`/admin/contents/${contentId}/toggle-open`);
};

// 콘텐츠 생성을 위한 Request Body 타입 (ContentCreate 스키마 기반)
export interface ContentCreatePayload {
  title: string;
  description?: string | null;
  content_type: 'story' | 'domination';
  exposure_slot: 'story' | 'event';
  is_always_on: boolean;
  reward_coin?: number;
  center_point?: { lon: number; lat: number } | null;
  start_at?: string | null;
  end_at?: string | null;
  stage_count?: number | null;
  is_sequential: boolean;
}

// 관리자용: 새 콘텐츠 생성 (POST /admin/contents)
export const createAdminContent = async (payload: ContentCreatePayload): Promise<Content> => {
  const response = await apiClient.post<Content>('/admin/contents', payload);
  return response.data;
};