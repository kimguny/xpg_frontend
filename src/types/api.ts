// src/types/api.ts

/** API 명세서의 공통 오류 응답 구조 (Error.details 내부) */
export interface ApiErrorDetail {
    field?: string;
    reason?: string;
    // 기타 동적으로 들어올 수 있는 필드를 처리하기 위해 Record<string, unknown> 사용
    [key: string]: unknown;
}

export interface ApiError {
    code: string;
    message: string;
    details?: ApiErrorDetail | ApiErrorDetail[];
}

export interface ApiErrorResponse {
    error: ApiError;
}
