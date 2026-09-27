import { createMapper } from '../factory/createMapper';
import {
  UploadImageResponseRaw,
  UploadImageResponse,
} from './types';
import {
  uploadImageResponseRawSchema,
} from './schemas';

// Mapper for upload image response
// Maps errorMessage from API response to message in frontend DTO
export const uploadImageMapper = createMapper<UploadImageResponseRaw, UploadImageResponse>(
  (response) => {
    return {
      success: response.success,
      message: response.errorMessage ?? '',
      imageUrl: response.imageUrl ?? undefined,
    };
  },
  uploadImageResponseRawSchema
);

