import axios, { AxiosInstance } from 'axios';
import { getAuthToken, removeAuthToken } from './cookies';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 1. 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✨ 1. 로그아웃이 이미 처리 중인지 확인하는 플래그를 추가합니다.
let isLoggingOut = false;

// 2. 응답 인터셉터
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const isLoginAttempt = error.config?.url?.includes('/auth/login');

        if ((status === 401 || status === 403) && !isLoginAttempt) {
            
            // ✨ 2. 로그아웃이 아직 처리되지 않았을 때만 아래 로직을 실행합니다.
            if (!isLoggingOut) {
                // ✨ 3. 로그아웃 처리를 시작한다고 플래그를 설정합니다.
                isLoggingOut = true;

                console.error(`Request failed with status ${status}. Token may be expired or invalid. Initiating auto-logout.`);
                
                removeAuthToken(); 
                
                if (typeof window !== 'undefined') {
                    alert("인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
                    window.location.href = '/login'; 
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;