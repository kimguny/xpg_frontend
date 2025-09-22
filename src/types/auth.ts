// 로그인 요청
export interface LoginRequest {
  idOrEmail: string;
  password: string;
}

// 사용자 정보
export interface User {
  id: string;
  loginId: string;
  email: string | null;
  nickname: string | null;
  status: string;
  isAdmin: boolean;
  adminRole?: string;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  user: User;
}

// 인증 상태
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}