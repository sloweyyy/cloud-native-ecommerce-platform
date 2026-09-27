import { z } from 'zod';
import {
  brandResponseSchema,
  typeResponseSchema,
} from './schemas';

// Response types (from API)
export type BrandResponse = z.infer<typeof brandResponseSchema>;
export type TypeResponse = z.infer<typeof typeResponseSchema>;

// DTO types (for application use)
export type Brand = z.infer<typeof brandResponseSchema>;
export type Type = z.infer<typeof typeResponseSchema>;

// Re-export input types from input.ts
export type {
  CreateBrandInput,
  CreateTypeInput,
} from './input';

