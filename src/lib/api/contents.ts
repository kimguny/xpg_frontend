import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

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
  is_test: boolean;
}

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
  is_test?: boolean;
}

export const getAdminContents = async (): Promise<PaginatedResponse<Content>> => {
  const response = await apiClient.get<PaginatedResponse<Content>>('/admin/contents', {
    params: { page: 1, size: 100 },
  });
  return response.data;
};

export const deleteAdminContent = async (contentId: string): Promise<void> => {
  await apiClient.delete(`/admin/contents/${contentId}`);
};

export const toggleContentStatus = async (contentId: string): Promise<void> => {
  await apiClient.patch(`/admin/contents/${contentId}/toggle-open`);
};

export const createAdminContent = async (payload: ContentCreatePayload): Promise<Content> => {
  const response = await apiClient.post<Content>('/admin/contents', payload);
  return response.data;
};

export const getAdminContentById = async (contentId: string): Promise<Content> => {
  const response = await apiClient.get<Content>(`/admin/contents/${contentId}`);
  return response.data;
};

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