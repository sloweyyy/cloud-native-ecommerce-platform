import { z } from 'zod';
import {
  uploadImageResponseRawSchema,
  uploadImageResponseSchema,
} from './schemas';

// Raw API response type (matches backend structure)
export type UploadImageResponseRaw = z.infer<typeof uploadImageResponseRawSchema>;

// DTO type (for frontend use)
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// Re-export input types from input.ts
export type {
  UploadImageInput,
} from './input';


