import { useMutation } from '@tanstack/react-query';
import { ReactMutationOptions } from '../types';
import { env } from '../../config';
import * as catalogApi from './apis';
import type { UploadImageResponse } from './types';

/**
 * Hook to upload a product image to S3
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const uploadImage = useUploadProductImage();
 *
 * function handleFileSelect(file: File) {
 *   uploadImage.mutate(file, {
 *     onSuccess: (data) => {
 *       if (data?.imageUrl) {
 *         message.success('Image uploaded successfully');
 *         setImageUrl(data.imageUrl);
 *       }
 *     },
 *     onError: (error) => {
 *       message.error('Failed to upload image');
 *     }
 *   });
 * }
 * ```
 */
export const useUploadProductImage = (options?: ReactMutationOptions<UploadImageResponse | null, Error, File>) => {
  return useMutation<UploadImageResponse | null, Error, File>({
    mutationFn: async (file: File) => {
      const result = await catalogApi.uploadProductImage({
        payload: { imageFile: file },
        params: {
          useMock: env.useMockData,
        },
      });
      return result?.data ?? null;
    },
    onSuccess: (data, variables, context, mutation) => {
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};
