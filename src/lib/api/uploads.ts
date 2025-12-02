import apiClient from '@/utils/apiClient';

export interface ImageUploadResponse {
  file_path: string;
  file_name: string;
  content_type: string;
  size: number;
}

export const uploadAdminImage = async (formData: FormData): Promise<ImageUploadResponse> => {
  const response = await apiClient.post<ImageUploadResponse>(
    '/admin/uploads/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};