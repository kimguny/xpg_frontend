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


// --- [추가] Store & Reward 타입 정의 ---

/** 리워드 상품 정보 (백엔드 StoreRewardResponse 스키마) */
export interface StoreReward {
    id: string; // UUID
    store_id: string; // UUID
    product_name: string;
    product_desc: string | null;
    image_url: string | null;
    price_coin: number;
    stock_qty: number | null;
    is_active: boolean;
    exposure_order: number | null;
}

/** 매장 정보 (백엔드 StoreResponse 스키마) */
export interface Store {
    id: string; // UUID
    store_name: string;
    description: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    display_start_at: string | null; // ISO 8601 datetime string
    display_end_at: string | null; // ISO 8601 datetime string
    is_always_on: boolean;
    map_image_url: string | null;
    show_products: boolean;
    rewards: StoreReward[];
}

// --- API 요청 Body 타입 ---

/** 매장 생성 시 데이터 (StoreCreate) */
export type StoreCreate = Omit<Store, 'id' | 'rewards'>;

/** 매장 수정 시 데이터 (StoreUpdate, 모든 필드 선택적) */
export type StoreUpdate = Partial<StoreCreate>;

/** 리워드 생성 시 데이터 (StoreRewardCreate) */
export type StoreRewardCreate = Omit<StoreReward, 'id' | 'store_id'>;

/** 리워드 수정 시 데이터 (StoreRewardUpdate, 모든 필드 선택적) */
export type StoreRewardUpdate = Partial<StoreRewardCreate>;
