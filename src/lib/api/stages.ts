import apiClient from '@/utils/apiClient';

// --- Hint Interfaces ---
export interface Hint {
  id: string;
  stage_id: string;
  preset: string;
  order_no: number;
  text_block_1: string | null;
  text_block_2: string | null;
  text_block_3: string | null;
  cooldown_sec: number;
  failure_cooldown_sec: number;
  reward_coin: number;
  nfc: {
    id: string;
    udid: string;
    tag_name: string;
  } | null;
  
  // [추가] 위치 정보 필드
  location: {
    lat: number;
    lon: number;
  } | null;
  radius_m: number | null;

  images: {
    url: string;
    alt_text: string | null;
    order_no: number;
  }[];
}

export interface HintCreatePayload {
  preset: string;
  order_no: number;
  text_blocks: string[];
  images?: { url: string; alt_text?: string; order_no: number }[] | null;
  cooldown_sec?: number;
  failure_cooldown_sec?: number;
  reward_coin?: number;
  nfc_id?: string | null;
  
  // [추가] 생성 Payload
  location?: { lat: number; lon: number } | null;
  radius_m?: number | null;
}

export interface HintUpdatePayload {
  preset?: string;
  text_blocks?: string[];
  images?: { url: string; alt_text?: string; order_no: number }[] | null;
  cooldown_sec?: number;
  failure_cooldown_sec?: number;
  reward_coin?: number;
  nfc_id?: string | null;
  
  // [추가] 수정 Payload
  location?: { lat: number; lon: number } | null;
  radius_m?: number | null;
}

// --- Puzzle Interfaces ---
export interface PuzzleConfigData {
  image_url?: string;
  image_desc?: string;
  text?: string;
  answer_style: '4_digits' | '6_digits' | 'text';
  answer: string;
  bonus_coin?: number;
}

export interface Puzzle {
  style: 'image' | 'text';
  showWhen: 'always' | 'after_clear';
  config: PuzzleConfigData;
}

export interface PuzzlePayload {
  puzzles: Puzzle[];
}

export interface PuzzleUpdateResponse {
  stage_id: string;
  puzzles: {
    id: string;
    style: string;
    show_when: string;
    config: object;
  }[];
}

// --- Stage Interfaces ---
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

export type StageUpdatePayload = Partial<StageCreatePayload>;

export interface UnlockConfigPayload {
  preset: 'fullscreen' | 'popup';
  next_action: 'next_step' | 'next_stage';
  image_url?: string | null;
  title?: string | null; 
  bottom_text?: string | null;
}

// --- API Functions ---

export const getAdminStages = async (contentId: string): Promise<Stage[]> => {
  const response = await apiClient.get<Stage[]>(`/admin/stages/by-content/${contentId}`);
  return response.data;
};

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

export const getAdminStageById = async (stageId: string): Promise<Stage> => {
  const response = await apiClient.get<Stage>(`/admin/stages/${stageId}`);
  return response.data;
};

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

// Hints
export const getAdminHintsForStage = async (stageId: string): Promise<Hint[]> => {
  const response = await apiClient.get<Hint[]>(`/admin/stages/${stageId}/hints`);
  return response.data;
};

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

export const updateAdminHint = async ({
  hintId,
  payload,
}: {
  hintId: string;
  payload: HintUpdatePayload;
}): Promise<Hint> => {
  const response = await apiClient.patch<Hint>(`/admin/stages/hints/${hintId}`, payload);
  return response.data;
};

export const deleteAdminHint = async (hintId: string): Promise<void> => {
  await apiClient.delete(`/admin/stages/hints/${hintId}`);
};

// Puzzles
export const updateStagePuzzles = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: PuzzlePayload;
}): Promise<PuzzleUpdateResponse> => { 
  const response = await apiClient.put<PuzzleUpdateResponse>(`/admin/stages/${stageId}/puzzles`, payload);
  return response.data;
};

// Unlock Config
export const updateUnlockConfig = async ({
  stageId,
  payload,
}: {
  stageId: string;
  payload: UnlockConfigPayload;
}): Promise<void> => {
  await apiClient.put(`/admin/stages/${stageId}/unlock`, payload);
};