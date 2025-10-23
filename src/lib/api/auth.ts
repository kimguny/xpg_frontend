import apiClient from '@/utils/apiClient';
import { LoginRequest, LoginResponse } from '@/types/auth';
import { ApiErrorResponse } from '@/types/api'; // 새로 정의된 타입 임포트
import axios from 'axios';
import { User } from '@/types/auth';

// API 명세: 4.1 인증/Auth(App) - POST /auth/login

/**
 * 관리자 로그인 API를 호출합니다.
 * @param loginData - { idOrEmail: string, password: string }
 * @returns JWT accessToken과 User 정보를 반환합니다.
 */
export const loginUser = async (loginData: LoginRequest): Promise<LoginResponse> => {
    try {
        // apiClient에 Base URL(/api/v1)이 설정되어 있으므로, /api/v1을 제거합니다.
        const response = await apiClient.post<LoginResponse>('/auth/login', loginData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            
            // 응답 데이터를 명시적인 타입(ApiErrorResponse)으로 캐스팅하여 any 사용을 방지
            const errorResponseData = error.response.data as ApiErrorResponse;
            console.error("Login API Error:", errorResponseData);
            
            // 401 UNAUTHORIZED 에러 처리
            if (error.response.status === 401) {
                // API 명세서의 Error Response (공통) 구조를 기반으로 메시지 반환
                const errorMessage = errorResponseData.error?.message || "인증 실패: 아이디 또는 비밀번호를 확인해주세요.";
                throw new Error(errorMessage);
            }

            // 그 외 다른 4xx/5xx 에러 메시지 반환
            const generalErrorMessage = errorResponseData.error?.message || "로그인 중 알 수 없는 오류가 발생했습니다.";
            throw new Error(generalErrorMessage);

        }
        throw new Error("네트워크 연결 오류가 발생했습니다.");
    }
};

/**
 * 로그아웃 처리는 일반적으로 클라이언트 측에서 토큰을 제거하는 방식으로 진행됩니다.
 * API 명세서(v3)에 POST /auth/logout 엔드포인트는 없습니다.
 */
export const logoutUser = async (): Promise<void> => {
    // await apiClient.post('/auth/logout'); 
    console.info("Client-side logout: Simply remove the token.");
};


// API 명세: 4.1 인증/Auth(App) - POST /auth/token/refresh
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
        // apiClient에 Base URL(/api/v1)이 설정되어 있으므로, /api/v1을 제거합니다.
        const response = await apiClient.post<{ accessToken: string }>('/auth/token/refresh', {
            refreshToken
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            throw new Error("리프레시 토큰이 만료되었습니다. 다시 로그인 해주세요.");
        }
        throw error;
    }
};

/**
 * API 명세: 4.2 Me(App) - GET /me
 * 현재 로그인된 사용자의 프로필 정보를 가져옵니다.
 * @returns User 정보를 반환합니다.
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/me');
  return response.data;
};