import { z } from 'zod';

/**
 * Backend response schema for product type/category
 */
export const productTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productTypesResponseSchema = z.array(productTypeResponseSchema);

/**
 * Frontend category DTO schema (flattened)
 */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameVi: z.string(),
  icon: z.string(),
  path: z.string(),
  imageUrl: z.string().optional(),
});

export const categoriesSchema = z.array(categorySchema);

