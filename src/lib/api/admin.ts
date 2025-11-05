import apiClient from '@/utils/apiClient';

// openapi.json을 기반으로 한 전체 응답 타입 정의
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface UserProfile {
  name?: string;
  phone?: string;
  points?: number;
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
  profile: UserProfile | null;
  created_at: string;
  last_active_at: string | null;
}

// Content 타입 (ContentResponse 스키마 기준)
export interface Content {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  background_image_url: string | null;
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
  active_stage_count: number;
}

// NfcTag 타입 (NFCTagResponse 스키마 기준)
export interface NfcTag {
  id: string;
  udid: string;
  tag_name: string;
  description: string | null;
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

// 사용자 목록 조회를 위한 파라미터 타입
export interface GetUsersParams {
  q?: string;
  status?: 'active' | 'blocked' | 'deleted';
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * 관리자용: 사용자 목록을 검색 조건과 함께 가져옵니다. (GET /admin/users)
 */
export const getAdminUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
  return response.data;
};

/**
 * 관리자용: 특정 사용자 삭제 (DELETE /admin/users/{userId})
 * (백엔드에 해당 API가 존재한다고 가정합니다)
 */
export const deleteAdminUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${userId}`);
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
  thumbnail_url?: string | null;
  background_image_url?: string | null;
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
  thumbnail_url?: string | null;
  background_image_url?: string | null;
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
  puzzles?: Puzzle[];
  unlock_config?: {
    preset: 'fullscreen' | 'popup';
    next_action: 'next_step' | 'next_stage';
    image_url?: string | null;
    bottom_text?: string | null;
    title?: string | null;
  } | null;
  created_at: string;
  hints?: Hint[];
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
  nfc: {
    id: string;
    udid: string;
    tag_name: string;
  } | null;
  images: {
    url: string;
    alt_text: string | null;
    order_no: number;
  }[];
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
// export interface PuzzlePayload {
//   puzzles: {
//     style: 'image' | 'text';
//     showWhen: 'always' | 'after_clear';
//     config: {
//       image_url?: string;
//       image_desc?: string;
//       text?: string;
//       answer_style: '4_digits' | '6_digits' | 'text';
//       answer: string;
//       bonus_coin?: number;
//     };
//   }[];
// }

export interface Puzzle {
  style: 'image' | 'text';
  showWhen: 'always' | 'after_clear';
  config: PuzzleConfigData;
}

export interface PuzzlePayload {
  puzzles: Puzzle[];
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

// 해금 설정을 위한 Payload 타입 (UnlockConfig 스키마 기반)
export interface UnlockConfigPayload {
  preset: 'fullscreen' | 'popup';
  next_action: 'next_step' | 'next_stage';
  image_url?: string | null;
  // 화면설계서의 '서브 타이틀'과 '하단 텍스트'를 포함하기 위해 text 필드 추가
  // API 명세와 다를 경우 백엔드와 협의가 필요합니다.
  title?: string | null; 
  bottom_text?: string | null;
}

/**
 * 관리자용: 스테이지 해금 설정 (PUT /admin/stages/{stageId}/unlock)
 */
export const updateUnlockConfig = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: UnlockConfigPayload;
}): Promise<void> => { // 이 API는 별도의 응답 본문이 없을 수 있습니다.
  await apiClient.put(`/admin/stages/${stageId}/unlock`, payload);
};

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

/**
 * 관리자용: 특정 사용자의 포인트를 수동으로 조정합니다. (POST /admin/users/{userId}/adjust-points)
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

export interface NFCTagCreatePayload {
  udid: string;
  tag_name: string;
  description: string | null;
  address?: string | null;
  floor_location?: string | null;
  media_url?: string | null;
  link_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tap_message?: string | null;
  point_reward?: number;
  cooldown_sec?: number;
  use_limit?: number | null;
  is_active?: boolean;
  category?: string | null;
}

// UDID를 제외한 모든 필드를 선택적으로(Partial) 만듭니다.
export type NFCTagUpdatePayload = Partial<Omit<NFCTagCreatePayload, 'udid'>>;

/**
 * 관리자용: 새 NFC 태그 생성 (POST /admin/nfc-tags)
 */
export const createAdminNfcTag = async (payload: NFCTagCreatePayload): Promise<NfcTag> => {
  const response = await apiClient.post<NfcTag>('/admin/nfc-tags', payload);
  return response.data;
};

/**
 * 관리자용: 특정 NFC 태그 상세 조회 (GET /admin/nfc-tags/{nfcId})
 */
export const getAdminNfcTagById = async (nfcId: string): Promise<NfcTag> => {
  const response = await apiClient.get<NfcTag>(`/admin/nfc-tags/${nfcId}`);
  return response.data;
};

/**
 * 관리자용: NFC 태그 수정 (PATCH /admin/nfc-tags/{nfcId})
 */
export const updateAdminNfcTag = async ({
  nfcId,
  payload,
}: {
  nfcId: string;
  payload: NFCTagUpdatePayload;
}): Promise<NfcTag> => {
  const response = await apiClient.patch<NfcTag>(`/admin/nfc-tags/${nfcId}`, payload);
  return response.data;
};

/**
 * 관리자용: NFC 태그 삭제 (DELETE /admin/nfc-tags/{nfcId})
 */
export const deleteAdminNfcTag = async (nfcId: string): Promise<void> => {
  await apiClient.delete(`/admin/nfc-tags/${nfcId}`);
};

// NFC 태그 목록 조회를 위한 파라미터 타입
export interface GetNfcTagsParams {
  page?: number;
  size?: number;
  category?: string;
  active?: boolean;
  search?: string;
  // (참고: 백엔드 API에 정렬(sort) 기능은 아직 없습니다.)
}

/**
 * 관리자용: 전체 NFC 태그 목록을 가져옵니다. (GET /admin/nfc-tags)
 */
export const getAdminNfcTags = async (
  params: GetNfcTagsParams = {}
): Promise<PaginatedResponse<NfcTag>> => {
  const response = await apiClient.get<PaginatedResponse<NfcTag>>('/admin/nfc-tags', {
    params, // 파라미터를 API 요청에 전달
  });
  return response.data;
};

// (1) 매장 상품(리워드) 응답 타입
export interface StoreReward {
  id: string;
  store_id: string;
  product_name: string;
  product_desc: string | null;
  image_url: string | null;
  price_coin: number;
  stock_qty: number | null;
  is_active: boolean;
  exposure_order: number | null;
  qr_image_url: string | null;
  category: string | null;
}

// (2) 매장 상품(리워드) 생성 요청 타입
export interface StoreRewardCreatePayload {
  product_name: string;
  product_desc?: string | null;
  image_url?: string | null;
  price_coin?: number;
  stock_qty?: number | null;
  is_active?: boolean;
  exposure_order?: number | null;
  category?: string | null;
}

// (3) 매장 응답 타입 (상품 목록 포함)
export interface Store {
  id: string;
  store_name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  display_start_at: string | null;
  display_end_at: string | null;
  is_always_on: boolean;
  map_image_url: string | null;
  show_products: boolean;
  rewards: StoreReward[];
}

// (4) 매장 생성 요청 타입
export interface StoreCreatePayload {
  store_name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  display_start_at?: string | null;
  display_end_at?: string | null;
  is_always_on?: boolean;
  map_image_url?: string | null;
  show_products?: boolean;
}

// (5) 매장 수정 요청 타입
export interface StoreUpdatePayload {
  store_name?: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  display_start_at?: string | null;
  display_end_at?: string | null;
  is_always_on?: boolean;
  map_image_url?: string | null;
  show_products?: boolean;
}

// (6) 매장 목록 조회 파라미터 타입
export interface GetStoresParams {
  skip?: number;
  limit?: number;
}

/**
 * 관리자용: 매장 목록 조회 (GET /admin/stores)
 */
export const getAdminStores = async (
  params: GetStoresParams = {}
): Promise<Store[]> => {
  const response = await apiClient.get<Store[]>('/admin/stores', { params });
  return response.data;
};

/**
 * 관리자용: 특정 매장 상세 조회 (GET /admin/stores/{storeId})
 */
export const getAdminStoreById = async (storeId: string): Promise<Store> => {
  const response = await apiClient.get<Store>(`/admin/stores/${storeId}`);
  return response.data;
};

/**
 * 관리자용: 새 매장 생성 (POST /admin/stores)
 */
export const createAdminStore = async (payload: StoreCreatePayload): Promise<Store> => {
  const response = await apiClient.post<Store>('/admin/stores', payload);
  return response.data;
};

/**
 * 관리자용: 매장 정보 수정 (PATCH /admin/stores/{storeId})
 */
export const updateAdminStore = async ({
  storeId,
  payload,
}: {
  storeId: string;
  payload: StoreUpdatePayload;
}): Promise<Store> => {
  const response = await apiClient.patch<Store>(`/admin/stores/${storeId}`, payload);
  return response.data;
};

/**
 * 관리자용: 매장 삭제 (DELETE /admin/stores/{storeId})
 */
export const deleteAdminStore = async (storeId: string): Promise<void> => {
  await apiClient.delete(`/admin/stores/${storeId}`);
};

/**
 * 관리자용: 매장 리워드(상품) 생성 (POST /admin/stores/{storeId}/rewards)
 */
export const createAdminStoreReward = async ({
  storeId,
  payload,
}: {
  storeId: string;
  payload: StoreRewardCreatePayload;
}): Promise<StoreReward> => {
  const response = await apiClient.post<StoreReward>(
    `/admin/stores/${storeId}/rewards`,
    payload
  );
  return response.data;
};

// src/lib/api/admin.ts 파일에 다음 API 함수를 추가합니다.

// (1) 매장 상품(리워드) 수정 요청 타입
export type StoreRewardUpdatePayload = Partial<StoreRewardCreatePayload>;

// (2) 리워드 목록 조회를 위한 파라미터 타입 (Pagination 필요)
export interface GetStoreRewardsParams {
  q?: string; // 검색어 (상품명/카테고리 등)
  category?: string; // 카테고리 필터
  is_active?: boolean; // 활성 상태 필터
  page?: number;
  size?: number;
  sort?: string; // 정렬
}

/**
 * 관리자용: 매장 리워드(상품) 목록 조회 (GET /admin/rewards)
 * (테이블 목록을 채우기 위해 사용)
 */
export const getAdminStoreRewards = async (
  params: GetStoreRewardsParams = {}
): Promise<PaginatedResponse<StoreReward>> => {
  // 예시: /admin/rewards?page=1&size=10&q=빵
  const response = await apiClient.get<PaginatedResponse<StoreReward>>(
    '/admin/rewards', 
    { params }
  );
  return response.data;
};

/**
 * 관리자용: 특정 리워드(상품) 상세 조회 (GET /admin/rewards/{rewardId})
 * (수정 모달에 초기 데이터를 채우기 위해 필요합니다)
 */
export const getAdminStoreRewardById = async (rewardId: string): Promise<StoreReward> => {
  const response = await apiClient.get<StoreReward>(`/admin/rewards/${rewardId}`);
  return response.data;
};

/**
 * 관리자용: 매장 리워드(상품) 정보 수정 (PATCH /admin/rewards/{rewardId})
 */
export const updateAdminStoreReward = async ({
  rewardId,
  payload,
}: {
  rewardId: string;
  payload: StoreRewardUpdatePayload;
}): Promise<StoreReward> => {
  const response = await apiClient.patch<StoreReward>(
    `/admin/rewards/${rewardId}`,
    payload
  );
  return response.data;
};

/**
 * 관리자용: 매장 리워드(상품) 삭제 (DELETE /admin/rewards/{rewardId})
 */
export const deleteAdminStoreReward = async (rewardId: string): Promise<void> => {
  await apiClient.delete(`/admin/rewards/${rewardId}`);
};

// QR 코드 생성 응답 타입
export interface GenerateQrResponse {
  qr_image_url: string;
  note: string;
}

/**
 * (관리자) 리워드 상품 교환용 QR 코드를 생성합니다.
 * (POST /admin/rewards/{rewardId}/generate-qr)
 */
export const generateAdminRewardQrCode = async (rewardId: string): Promise<GenerateQrResponse> => {
  const response = await apiClient.post<GenerateQrResponse>(
    `/admin/rewards/${rewardId}/generate-qr`
  );
  return response.data;
};

// 1. 통계 응답 타입 정의
export interface AdminStatsResponse {
  today_consumed_count: number;
  total_consumed_count: number;
  total_points_spent: number;
  low_stock_count: number;
}

/**
 * 관리자 대시보드 4개 카드 통계 조회 (GET /api/v1/admin/stats)
 */
export const getAdminDashboardStats = async (): Promise<AdminStatsResponse> => {
  const response = await apiClient.get<AdminStatsResponse>('/admin/stats');
  return response.data;
};

// ==========================================================
// 결제 내역 (Reward Ledger) API
// ==========================================================

// 1. 결제 내역 응답 타입 (RewardLedgerItem)
export interface RewardLedgerItem {
  id: number;
  created_at: string;
  coin_delta: number;
  note: string | null;
  // User 정보 (JOIN)
  user: {
    id: string;
    login_id: string;
    nickname: string | null;
  } | null;
  // 상품 정보 (JOIN)
  reward: {
    id: string;
    product_name: string;
  } | null;
  // 콘텐츠 정보 (JOIN)
  content: {
    id: string;
    title: string;
  } | null;
  // 스테이지 정보 (JOIN)
  stage: {
    id: string;
    title: string;
  } | null;
}

// 2. 결제 내역 조회 파라미터
export interface GetRewardLedgerParams {
  page?: number;
  size?: number;
  sort?: string; // 예: "created_at,DESC"
  user_id?: string; // 특정 유저 필터 (옵션)
  q?: string; // 검색 (옵션)
}

/**
 * 관리자용: 전체 결제 내역(RewardLedger) 목록을 조회합니다.
 * (GET /api/v1/admin/reward-ledger)
 */
export const getAdminRewardLedger = async (
  params: GetRewardLedgerParams = {}
): Promise<PaginatedResponse<RewardLedgerItem>> => {
  const response = await apiClient.get<PaginatedResponse<RewardLedgerItem>>(
    '/admin/reward-ledger', // 백엔드 API 엔드포인트
    { params }
  );
  return response.data;
};

// ==========================================================
// HOME 대시보드 API (GET /api/v1/admin/home-dashboard)
// ==========================================================

// 1. API Raw 응답 타입 (백엔드가 보내는 snake_case)
interface UserStatsRaw {
  total: number;
  today_signups: number;
  today_withdrawals: number;
}
interface ContentStatsRaw {
  active_count: number;
  total: number;
}
interface NfcTagStatsRaw {
  active_count: number;
  total: number;
}
interface OngoingContentRaw {
  id: string; // UUID는 string으로 받음
  title: string;
  start_at: string | null;
  end_at: string | null;
  participant_count: number;
}
interface HomeDashboardResponseRaw {
  users: UserStatsRaw;
  contents: ContentStatsRaw;
  nfc_tags: NfcTagStatsRaw;
  rewards: { status: string };
  errors: { status: string };
  promo: { status: string };
  ongoing_contents: OngoingContentRaw[];
}

// 2. 컴포넌트가 사용할 타입 (카드는 camelCase, 테이블은 snake_case)
export interface UserStats {
  total: number;
  todaySignups: number;
  todayWithdrawals: number;
}
export interface ContentStats {
  activeCount: number;
  total: number;
}
export interface NfcTagStats {
  activeCount: number;
  total: number;
}
export interface HomeDashboardResponse {
  users: UserStats;
  contents: ContentStats;
  nfcTags: NfcTagStats;
  rewards: { status: string };
  errors: { status: string };
  promo: { status: string };
  ongoingContents: OngoingContentRaw[]; // 테이블은 snake_case 유지
}

// 3. 데이터 변환 함수 (snake_case -> 부분적 camelCase)
const transformDashboardData = (data: HomeDashboardResponseRaw): HomeDashboardResponse => {
  return {
    // 카드 통계는 camelCase로 변환
    users: {
      total: data.users.total,
      todaySignups: data.users.today_signups,
      todayWithdrawals: data.users.today_withdrawals,
    },
    contents: {
      activeCount: data.contents.active_count,
      total: data.contents.total,
    },
    nfcTags: {
      activeCount: data.nfc_tags.active_count,
      total: data.nfc_tags.total,
    },
    // 테이블 데이터는 snake_case 그대로 전달
    ongoingContents: data.ongoing_contents,
    // 나머지 필드
    rewards: data.rewards,
    errors: data.errors,
    promo: data.promo,
  };
};

// 4. API 호출 함수 (데이터 변환 기능 포함)
/**
 * 관리자 HOME 대시보드 전체 데이터 조회
 */
export const getAdminHomeDashboard = async (): Promise<HomeDashboardResponse> => {
  const response = await apiClient.get<HomeDashboardResponseRaw>('/admin/home-dashboard');
  // API(snake_case) -> 컴포넌트(camelCase) 변환 후 반환
  return transformDashboardData(response.data);
};

// ==========================================================
// [신규] 관리자용 범용 이미지 업로드 API
// ==========================================================

// 1. 업로드 응답 타입
export interface ImageUploadResponse {
  file_path: string; // 예: /media/images/uuid.png
  file_name: string;
  content_type: string;
  size: number;
}

/**
 * 관리자용: 이미지를 서버에 업로드합니다.
 */
export const uploadAdminImage = async (formData: FormData): Promise<ImageUploadResponse> => {
  const response = await apiClient.post<ImageUploadResponse>(
    '/admin/uploads/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// ==========================================================
// 사용자 프로필 (GET /api/v1/me) API
// ==========================================================

// 1. GET /me API 응답 타입 (UserResponse 스키마 기반)
export interface MeResponse {
  id: string;
  login_id: string;
  email: string | null;
  nickname: string | null;
  profile_image_url: string | null;
  email_verified: boolean;
  status: string;
  profile: {
    name?: string;
    phone?: string;
    points?: number;
  } | null; 
  points: number;
  created_at: string;
  last_active_at: string | null;
}

/**
 * [신규] 현재 로그인된 사용자 정보(me)를 조회합니다.
 * (GET /api/v1/me)
 */
export const getMe = async (): Promise<MeResponse> => {
  // apiClient가 /api/v1을 기본 경로로 사용한다고 가정
  const response = await apiClient.get<MeResponse>('/me');
  return response.data;
};