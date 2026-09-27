import { createApiFactory } from '../factory/createApiFactory';
import { RequestPayloadRequired } from '../types';
import {
  uploadImageMapper,
} from './mappers';
import {
  UploadImageResponseRaw,
  UploadImageResponse,
} from './types';
import {
  uploadImageResponseRawSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Catalog', { version: 'v1' });

/**
 * Upload a product image to S3
 *
 * @param request - Request with image file
 * @param request.payload.imageFile - The image file to upload
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Upload response with image URL
 *
 * @example
 * ```typescript
 * const result = await uploadProductImage({
 *   payload: {
 *     imageFile: file
 *   }
 * });
 * ```
 */
export async function uploadProductImage(
  request: RequestPayloadRequired<{ imageFile: File }>
) {
  // Validate the payload manually before creating FormData
  // File objects can't be validated through Zod in the standard way
  if (!(request.payload.imageFile instanceof File)) {
    throw new Error('imageFile must be an instance of File');
  }

  const formData = new FormData();
  formData.append('imageFile', request.payload.imageFile);

  // For FormData uploads, we need to pass it directly in options.data
  // The request interceptor will automatically remove Content-Type header
  // so axios can set it with the proper boundary (multipart/form-data; boundary=...)
  return apiFactory<UploadImageResponseRaw, UploadImageResponse>(
    'POST',
    '/UploadProductImage',
    {
      payload: { imageFile: request.payload.imageFile },
      options: {
        ...request.options,
        data: formData, // Override filteredPayload with FormData
      },
      params: request.params,
    },
    {
      transformer: uploadImageMapper.toDto,
      // Skip paramsSchema validation for File uploads since File is in payload, not params
      // The File validation is done manually above
      responseSchema: uploadImageResponseRawSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}
