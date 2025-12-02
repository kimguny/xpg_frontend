import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

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

export type NFCTagUpdatePayload = Partial<Omit<NFCTagCreatePayload, 'udid'>>;

export interface GetNfcTagsParams {
  page?: number;
  size?: number;
  category?: string;
  active?: boolean;
  search?: string;
  sort?: string;
}

export const createAdminNfcTag = async (payload: NFCTagCreatePayload): Promise<NfcTag> => {
  const response = await apiClient.post<NfcTag>('/admin/nfc-tags', payload);
  return response.data;
};

export const getAdminNfcTagById = async (nfcId: string): Promise<NfcTag> => {
  const response = await apiClient.get<NfcTag>(`/admin/nfc-tags/${nfcId}`);
  return response.data;
};

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

export const deleteAdminNfcTag = async (nfcId: string): Promise<void> => {
  await apiClient.delete(`/admin/nfc-tags/${nfcId}`);
};

export const getAdminNfcTags = async (
  params: GetNfcTagsParams = {}
): Promise<PaginatedResponse<NfcTag>> => {
  const response = await apiClient.get<PaginatedResponse<NfcTag>>('/admin/nfc-tags', {
    params,
  });
  return response.data;
};