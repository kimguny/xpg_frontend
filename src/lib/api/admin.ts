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

// 콘텐츠 수정을 위한 Request Body 타입
export interface ContentUpdatePayload {
  title?: string;
  description?: string | null;
  content_type?: 'story' | 'domination';
  exposure_slot?: 'story' | 'event';
  is_always_on?: boolean;
  reward_coin?: number;
  center_point?: { lon: number; lat: number } | null;
  start_at?: string | null;
  end_at?: string | null;
  stage_count?: number | null;
  is_sequential?: boolean;
}

/**
 * 관리자용: 특정 콘텐츠 상세 정보 조회 (GET /admin/contents/{contentId})
 */
export const getAdminContentById = async (contentId: string): Promise<Content> => {
  const response = await apiClient.get<Content>(`/admin/contents/${contentId}`);
  return response.data;
};

/**
 * 관리자용: 콘텐츠 정보 수정 (PATCH /admin/contents/{contentId})
 */
export const updateAdminContent = async ({ 
  contentId, 
  payload 
}: { 
  contentId: string; 
  payload: ContentUpdatePayload; 
}): Promise<Content> => {
  const response = await apiClient.patch<Content>(`/admin/contents/${contentId}`, payload);
  return response.data;
};

export interface PuzzleConfigData {
  image_url?: string;
  image_desc?: string;
  text?: string;
  answer_style: '4_digits' | '6_digits' | 'text';
  answer: string;
  bonus_coin?: number;
}

// Stage 타입 (StageResponse 스키마 기준)
export interface Stage {
  id: string;
  content_id: string;
  parent_stage_id: string | null;
  stage_no: string;
  title: string;
  description: string | null;
  start_button_text: string | null;
  uses_nfc: boolean;
  is_hidden: boolean;
  time_limit_min: number | null;
  clear_need_nfc_count: number | null;
  clear_time_attack_sec: number | null;
  location: {
    lon: number;
    lat: number;
    radius_m?: number | null;
  } | null;
  unlock_on_enter_radius: boolean;
  is_open: boolean;
  unlock_stage_id: string | null;
  background_image_url: string | null;
  thumbnail_url: string | null;
  meta: object | null;
  puzzles?: {
    style: string;
    showWhen: string;
    config: PuzzleConfigData;
  }[];
  created_at: string;
}

/**
 * 관리자용: 특정 콘텐츠의 스테이지 목록 조회 (GET /admin/stages/by-content/{contentId})
 */
export const getAdminStages = async (contentId: string): Promise<Stage[]> => {
  const response = await apiClient.get<Stage[]>(`/admin/stages/by-content/${contentId}`);
  return response.data;
};

// 스테이지 생성을 위한 Request Body 타입 (StageCreate 스키마 기반)
export interface StageCreatePayload {
  stage_no: string;
  title: string;
  description?: string | null;
  start_button_text?: string | null;
  is_hidden?: boolean;
  time_limit_min?: number | null;
  clear_need_nfc_count?: number | null;
  clear_time_attack_sec?: number | null;
  location?: {
    lon: number;
    lat: number;
    radius_m?: number | null;
  } | null;
  unlock_on_enter_radius?: boolean;
  unlock_stage_id?: string | null;
  background_image_url?: string | null;
  thumbnail_url?: string | null;
  meta?: object | null;
}

// 스테이지 수정을 위한 Request Body 타입 (StageUpdate 스키마 기반)
export type StageUpdatePayload = Partial<StageCreatePayload>;

/**
 * 관리자용: 새 스테이지 생성 (POST /admin/stages)
 */
export const createAdminStage = async ({
  contentId,
  payload,
}: {
  contentId: string;
  payload: StageCreatePayload;
}): Promise<Stage> => {
  const response = await apiClient.post<Stage>(`/admin/stages?content_id=${contentId}`, payload);
  return response.data;
};

/**
 * 관리자용: 특정 스테이지 상세 정보 조회 (GET /admin/stages/{stageId})
 * (백엔드에 해당 API가 존재한다고 가정합니다)
 */
export const getAdminStageById = async (stageId: string): Promise<Stage> => {
  const response = await apiClient.get<Stage>(`/admin/stages/${stageId}`);
  return response.data;
};

/**
 * 관리자용: 스테이지 정보 수정 (PATCH /admin/stages/{stageId})
 */
export const updateAdminStage = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: StageUpdatePayload;
}): Promise<Stage> => {
  const response = await apiClient.patch<Stage>(`/admin/stages/${stageId}`, payload);
  return response.data;
};

// 힌트 생성을 위한 Request Body 타입 (HintCreate 스키마 기반)
export interface HintCreatePayload {
  preset: string;
  order_no: number;
  text_blocks: string[];
  cooldown_sec?: number;
  reward_coin?: number;
  nfc_id?: string | null;
}

// 힌트 응답 타입 (HintResponse 스키마 기반)
export interface Hint {
  id: string;
  stage_id: string;
  preset: string;
  order_no: number;
  text_block_1: string | null;
  text_block_2: string | null;
  text_block_3: string | null;
  // ... 그 외 nfc, images 등 필드
}

/**
 * 관리자용: 특정 스테이지의 모든 힌트 조회 (GET /admin/stages/{stageId}/hints)
 * (백엔드에 해당 API가 존재한다고 가정합니다)
 */
export const getAdminHintsForStage = async (stageId: string): Promise<Hint[]> => {
  const response = await apiClient.get<Hint[]>(`/admin/stages/${stageId}/hints`);
  return response.data;
};

/**
 * 관리자용: 새 힌트 생성 (POST /admin/stages/{stageId}/hints)
 */
export const createAdminHint = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: HintCreatePayload;
}): Promise<Hint> => {
  const response = await apiClient.post<Hint>(`/admin/stages/${stageId}/hints`, payload);
  return response.data;
};
// 1. 요청 시 보내는 데이터의 타입 (기존과 동일)
export interface PuzzlePayload {
  puzzles: {
    style: 'image' | 'text';
    showWhen: 'always' | 'after_clear';
    config: {
      image_url?: string;
      image_desc?: string;
      text?: string;
      answer_style: '4_digits' | '6_digits' | 'text';
      answer: string;
      bonus_coin?: number;
    };
  }[];
}

// 2. API가 응답으로 돌려주는 데이터의 타입 (새로 정의)
export interface PuzzleUpdateResponse {
  stage_id: string;
  puzzles: {
    id: string; // ✨ 서버에서 생성된 고유 ID가 포함됩니다.
    style: string;
    show_when: string;
    config: object;
  }[];
}

/**
 * 관리자용: 스테이지 퍼즐 설정 (PUT /admin/stages/{stageId}/puzzles)
 */
export const updateStagePuzzles = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: PuzzlePayload;
  // ✨ 3. 반환 타입을 PuzzleUpdateResponse로 지정합니다.
}): Promise<PuzzleUpdateResponse> => { 
  const response = await apiClient.put<PuzzleUpdateResponse>(`/admin/stages/${stageId}/puzzles`, payload);
  return response.data;
};