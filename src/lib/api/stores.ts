import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

// --- Store Reward Interfaces ---
export interface StoreReward {
  id: string;
  store_id: string;
  product_name: string;
  product_desc: string | null;
  image_url: string | null;
  price_coin: number;
  initial_quantity: number | null; 
  stock_qty: number | null;
  is_active: boolean;
  exposure_order: number | null;
  qr_image_url: string | null;
  category: string | null;
  store: { store_name: string };
}

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

export type StoreRewardUpdatePayload = Partial<StoreRewardCreatePayload>;

export interface GetStoreRewardsParams {
  q?: string;
  category?: string;
  is_active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// --- Store Interfaces ---
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

export interface GetStoresParams {
  skip?: number;
  limit?: number;
}

export interface GenerateQrResponse {
  qr_image_url: string;
  note: string;
}

// --- Store API ---
export const getAdminStores = async (
  params: GetStoresParams = {}
): Promise<Store[]> => {
  const response = await apiClient.get<Store[]>('/admin/stores', { params });
  return response.data;
};

export const getAdminStoreById = async (storeId: string): Promise<Store> => {
  const response = await apiClient.get<Store>(`/admin/stores/${storeId}`);
  return response.data;
};

export const createAdminStore = async (payload: StoreCreatePayload): Promise<Store> => {
  const response = await apiClient.post<Store>('/admin/stores', payload);
  return response.data;
};

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

export const deleteAdminStore = async (storeId: string): Promise<void> => {
  await apiClient.delete(`/admin/stores/${storeId}`);
};

// --- Reward API ---
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

export const getAdminStoreRewards = async (
  params: GetStoreRewardsParams = {}
): Promise<PaginatedResponse<StoreReward>> => {
  const response = await apiClient.get<PaginatedResponse<StoreReward>>(
    '/admin/rewards', 
    { params }
  );
  return response.data;
};

export const getAdminStoreRewardById = async (rewardId: string): Promise<StoreReward> => {
  const response = await apiClient.get<StoreReward>(`/admin/rewards/${rewardId}`);
  return response.data;
};

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

export const deleteAdminStoreReward = async (rewardId: string): Promise<void> => {
  await apiClient.delete(`/admin/rewards/${rewardId}`);
};

export const generateAdminRewardQrCode = async (rewardId: string): Promise<GenerateQrResponse> => {
  const response = await apiClient.post<GenerateQrResponse>(
    `/admin/rewards/${rewardId}/generate-qr`
  );
  return response.data;
};