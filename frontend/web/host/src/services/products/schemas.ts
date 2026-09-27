import { z } from 'zod';

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: z.object({
    name: z.string(),
    id: z.string(),
  }),
  types: z.object({
    name: z.string(),
    id: z.string(),
  }),
  price: z.number().nonnegative(),
});

export const productsResponseSchema = z.object({
  pageIndex: z.number().nonnegative(),
  pageSize: z.number().positive(),
  count: z.number().nonnegative(),
  data: z.array(productResponseSchema),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  price: z.number().nonnegative(),
  productType: z.string(),
  productBrand: z.string(),
  imageUrl: z.string().optional(),
  ratingAverage: z.number().min(0).max(5).optional(),
  ratingCount: z.number().nonnegative().optional(),
});

export const productsSchema = z.array(productSchema);

