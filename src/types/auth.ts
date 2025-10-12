// src/types/auth.ts

/** 로그인 요청 시 사용되는 데이터 구조 */
export interface LoginRequest {
    idOrEmail: string;
    password: string;
}

/** 백엔드 User 모델 */
export interface User {
    id: string;
    loginId: string;
    email: string | null;
    nickname: string | null;
    // DB 스키마: status는 'active', 'blocked', 'deleted' 중 하나입니다.
    status: 'active' | 'blocked' | 'deleted'; 
    
    // 관리자 관련 필드
    isAdmin: boolean;
    adminRole?: string; // 예: 'SUPER_ADMIN', 'CONTENT_MANAGER'
}

/** 로그인 성공 시 응답 데이터 구조 */
export interface LoginResponse {
    accessToken: string;
    user: User;
}

// Recoil 상태를 위한 타입
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
