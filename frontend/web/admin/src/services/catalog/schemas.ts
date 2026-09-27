import { z } from 'zod';

// Raw API response schema (matches backend structure)
export const uploadImageResponseRawSchema = z.object({
  success: z.boolean(),
  errorMessage: z.string(),
  imageUrl: z.string().optional(),
});

// DTO schema (for frontend use)
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string().optional(),
});


