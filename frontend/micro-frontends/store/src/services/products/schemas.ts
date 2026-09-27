import { z } from 'zod';

export const brandResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const productTypeResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const productsResponseSchema = z.object({
  pageIndex: z.number().nonnegative(),
  pageSize: z.number().positive(),
  count: z.number().nonnegative(),
  data: z.array(productResponseSchema),
});

export const productDetailResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const reviewSchema = z.object({
  reviewId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string(),
  helpfulCount: z.number().nonnegative().default(0),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const brandArrayResponseSchema = z.array(brandResponseSchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productTypeArrayResponseSchema = z.array(
  productTypeResponseSchema
);

export const paginatedProductsSchema = z.object({
  pageIndex: z.number().nonnegative(),
  pageSize: z.number().positive(),
  count: z.number().nonnegative(),
  data: z.array(productSchema),
});

export type BrandResponse = z.infer<typeof brandResponseSchema>;
export type ProductTypeResponse = z.infer<typeof productTypeResponseSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
export type ProductDetailResponse = z.infer<typeof productDetailResponseSchema>;

export type Product = z.infer<typeof productSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type ProductType = z.infer<typeof productTypeSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>;
