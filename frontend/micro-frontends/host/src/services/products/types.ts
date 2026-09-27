import { z } from 'zod';
import {
  productResponseSchema,
  productsResponseSchema,
  productSchema,
  productsSchema,
} from './schemas';

export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
export type Product = z.infer<typeof productSchema>;
export type Products = z.infer<typeof productsSchema>;

export type ProductsParams = {
  PageIndex?: number;
  PageSize?: number;
  BrandId?: string;
  TypeId?: string;
  Search?: string;
  Sort?: string;
};

