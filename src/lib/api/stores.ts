import apiClient from '@/utils/apiClient';
import { Store, StoreCreate, StoreUpdate, StoreReward, StoreRewardCreate } from '@/types/api';

/** (관리자) 모든 매장 목록 조회 */
export const getStores = async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/admin/stores');
    return response.data;
};

/** (관리자) 특정 매장 정보 조회 */
export const getStoreById = async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/admin/stores/${id}`);
    return response.data;
};

/** (관리자) 새 매장 생성 */
export const createStore = async (data: StoreCreate): Promise<Store> => {
    const response = await apiClient.post<Store>('/admin/stores', data);
    return response.data;
};

/** (관리자) 매장 정보 수정 */
export const updateStore = async (id: string, data: StoreUpdate): Promise<Store> => {
    const response = await apiClient.patch<Store>(`/admin/stores/${id}`, data);
    return response.data;
};

/** (관리자) 매장 삭제 */
export const deleteStore = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/stores/${id}`);
};

/** (관리자) 특정 매장에 리워드 상품 추가 */
export const createRewardForStore = async (storeId: string, data: StoreRewardCreate): Promise<StoreReward> => {
    const response = await apiClient.post<StoreReward>(`/admin/stores/${storeId}/rewards`, data);
    return response.data;
};
