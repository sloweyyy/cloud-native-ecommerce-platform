import { z } from 'zod';
import {
  productResponseSchema,
  paginationSchema,
  productBrandSchema,
  productTypeSchema,
} from './schemas';

// Response types (from API)
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsResponse = z.infer<typeof paginationSchema>;

// DTO types (for application use)
export type Product = z.infer<typeof productResponseSchema>;
export type PaginatedProducts = z.infer<typeof paginationSchema>;

// Additional types
export type ProductBrand = z.infer<typeof productBrandSchema>;
export type ProductType = z.infer<typeof productTypeSchema>;

// Re-export input types from input.ts
export type {
  ProductsParamsInput,
  ProductByIdInput,
  CreateProductInput,
  UpdateProductInput,
} from './input';

