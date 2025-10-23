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

let isLoggingOut = false;

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const isLoginAttempt = error.config?.url?.includes('/auth/login');

        if ((status === 401 || status === 403) && !isLoginAttempt) {
            if (!isLoggingOut) {
                isLoggingOut = true;

                console.error(`Request failed with status ${status}. Token may be expired or invalid. Initiating auto-logout.`);
                
                removeAuthToken(); 
                
                if (typeof window !== 'undefined') {
                    alert("인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
                    window.location.href = '/login'; 
                }

                // ✨ 1. 인증 오류는 여기서 처리하고, 더 이상 에러를 전파하지 않습니다.
                // 이렇게 하면 react-query가 이 에러를 다시 처리하지 않습니다.
                return new Promise(() => {}); 
            }
        }

        // ✨ 2. 인증 오류가 아닌 다른 모든 에러는 정상적으로 전파합니다.
        return Promise.reject(error);
    }
);

export default apiClient;