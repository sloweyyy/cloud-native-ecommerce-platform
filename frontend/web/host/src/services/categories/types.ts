import { z } from 'zod';
import {
  productTypeResponseSchema,
  productTypesResponseSchema,
  categorySchema,
  categoriesSchema,
} from './schemas';

/**
 * Backend response types
 */
export type ProductTypeResponse = z.infer<typeof productTypeResponseSchema>;
export type ProductTypesResponse = z.infer<typeof productTypesResponseSchema>;

/**
 * Frontend DTO types
 */
export type Category = z.infer<typeof categorySchema>;
export type Categories = z.infer<typeof categoriesSchema>;

