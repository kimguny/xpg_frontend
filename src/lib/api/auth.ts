import apiClient from '@/lib/api';
import { LoginRequest, LoginResponse } from '@/types/auth';

// 로그인 API 호출
export const loginUser = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', loginData);
  return response.data;
};

// 로그아웃 API 호출 
export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/api/v1/auth/logout');
};

// 토큰 갱신 API 호출
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<{ accessToken: string }>('/api/v1/auth/token/refresh', {
    refreshToken
  });
  return response.data;
};