import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for upload product image operation
export const uploadImageInput = createApiInputFactory(
  z.object({
    imageFile: z.instanceof(File),
  })
);

// Export inferred types
export type UploadImageInput = z.infer<typeof uploadImageInput>;

