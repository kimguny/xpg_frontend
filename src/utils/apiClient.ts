import axios, { AxiosInstance } from 'axios';
import { getAuthToken, removeAuthToken } from './cookies';

// 환경 변수에서 API Base URL을 가져옵니다.
const baseURL = process.env.NEXT_PUBLIC_API_URL;

// Base URL을 포함하는 Axios 인스턴스를 생성합니다.
// NEXT_PUBLIC_API_URL이 http://localhost:8000 일 경우, 최종 baseURL은 http://localhost:8000/api/v1 입니다.
const apiClient: AxiosInstance = axios.create({
  // 백엔드 API 명세서 Base URL: https://api.xpg.example.com/api/v1
  baseURL: `${baseURL}/api/v1`, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 사용 시 필수
});

// 1. 요청 인터셉터: 모든 요청에 JWT(액세스 토큰)를 자동으로 추가합니다.
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken(); // 쿠키에서 토큰을 가져옵니다.

    if (token) {
      // API 명세에 따라 Authorization: Bearer <JWT> 형태로 헤더를 설정합니다.
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. 응답 인터셉터: 401 Unauthorized 에러 발생 시 자동 로그아웃 및 리디렉션을 처리합니다.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // 로그인 요청 (/auth/login) 자체가 401인 경우는 ID/PW 오류이므로 자동 로그아웃을 건너뜁니다.
        const isLoginAttempt = error.config?.url?.includes('/auth/login');

        if (status === 401 && !isLoginAttempt) {
            console.error("Authentication failed (401). Token expired or invalid. Initiating auto-logout.");
            
            // 토큰을 쿠키에서 삭제
            removeAuthToken(); 
            
            // 로그인 페이지로 리디렉션
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
