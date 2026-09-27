import { z } from 'zod';

export const brandResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const typeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const createBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
});

export const createTypeInputSchema = z.object({
  name: z.string().min(1, 'Type name is required'),
});

