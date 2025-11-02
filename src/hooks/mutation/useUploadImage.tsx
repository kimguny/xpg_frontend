import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAdminImage, ImageUploadResponse } from '@/lib/api/admin';

export const useUploadImage = () => {
  return useMutation<ImageUploadResponse, Error, FormData>({
    mutationFn: (formData) => uploadAdminImage(formData),
  });
};