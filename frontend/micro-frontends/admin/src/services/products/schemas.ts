import { z } from 'zod';

export const productBrandSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

export const productTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageFile: z.string().optional().nullable(),
  price: z.number(),
  brands: productBrandSchema.optional().nullable(),
  types: productTypeSchema.optional().nullable(),
});

export const paginationSchema = z.object({
  pageIndex: z.number(),
  pageSize: z.number(),
  count: z.number(),
  data: z.array(productResponseSchema),
});

export const createProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  summary: z.string().optional(),
  description: z.string().optional(),
  imageFile: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  brands: productBrandSchema.optional(),
  types: productTypeSchema.optional(),
});

export const updateProductInputSchema = createProductInputSchema.extend({
  id: z.string().min(1, 'Product ID is required'),
});

export const catalogSpecParamsSchema = z.object({
  pageIndex: z.number().optional(),
  pageSize: z.number().optional(),
  brandId: z.string().optional(),
  typeId: z.string().optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
});

