import apiClient from '@/utils/apiClient';
import { StoreReward, StoreRewardUpdate } from '@/types/api';

/** (관리자) 리워드 상품 정보 수정 */
export const updateReward = async (id: string, data: StoreRewardUpdate): Promise<StoreReward> => {
    const response = await apiClient.patch<StoreReward>(`/admin/rewards/${id}`, data);
    return response.data;
};

/** (관리자) 리워드 상품 삭제 */
export const deleteReward = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/rewards/${id}`);
};
