import apiClient from '@/utils/apiClient';
import { PaginatedResponse } from './common';

// --- Notification Interfaces ---
export interface Notification {
  id: string;
  title: string;
  content: string;
  notification_type: 'system' | 'event' | 'promotion';
  start_at: string;
  end_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'expired';
  show_popup_on_app_start: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationCreatePayload {
  title: string;
  content: string;
  notification_type: 'system' | 'event' | 'promotion';
  start_at: string;
  end_at: string;
  show_popup_on_app_start?: boolean;
  is_draft?: boolean;
}

export interface NotificationUpdatePayload {
  title?: string;
  content?: string;
  notification_type?: 'system' | 'event' | 'promotion';
  start_at?: string;
  end_at?: string;
  show_popup_on_app_start?: boolean;
  is_draft?: boolean;
}

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  status?: 'draft' | 'scheduled' | 'published' | 'expired' | 'all';
  notification_type?: 'system' | 'event' | 'promotion';
  search?: string;
}

// --- Notification API ---
export const getAdminNotifications = async (
  params: GetNotificationsParams = {}
): Promise<PaginatedResponse<Notification>> => {
  const response = await apiClient.get<PaginatedResponse<Notification>>(
    '/admin/notifications',
    { params }
  );
  return response.data;
};

export const getAdminNotificationById = async (
  notificationId: string
): Promise<Notification> => {
  const response = await apiClient.get<Notification>(
    `/admin/notifications/${notificationId}`
  );
  return response.data;
};

export const createAdminNotification = async (
  payload: NotificationCreatePayload
): Promise<Notification> => {
  const response = await apiClient.post<Notification>(
    '/admin/notifications',
    payload
  );
  return response.data;
};

export const updateAdminNotification = async ({
  notificationId,
  payload,
}: {
  notificationId: string;
  payload: NotificationUpdatePayload;
}): Promise<Notification> => {
  const response = await apiClient.patch<Notification>(
    `/admin/notifications/${notificationId}`,
    payload
  );
  return response.data;
};

export const deleteAdminNotification = async (
  notificationId: string
): Promise<{ deleted: boolean; notification_id: string }> => {
  const response = await apiClient.delete(
    `/admin/notifications/${notificationId}`
  );
  return response.data;
};