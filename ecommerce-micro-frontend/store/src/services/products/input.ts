import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for getting all products
// createApiInputFactory automatically adds: PageIndex, PageSize, orderBy
// Backend expects: PageIndex, PageSize, BrandId, TypeId, Sort, Search
export const storeParamsInput = createApiInputFactory(
  z.object({
    BrandId: z.string().optional(),
    TypeId: z.string().optional(),
    Sort: z.string().optional(),
    Search: z.string().optional(),
    useMock: z.boolean().optional(),
  })
);

export const productByIdInput = createApiInputFactory(
  z.object({
    id: z.string(),
  })
);

export const brandsInput = createApiInputFactory(z.object({}));

export const typesInput = createApiInputFactory(z.object({}));

export type StoreParamsInput = z.infer<typeof storeParamsInput>;
export type ProductByIdInput = z.infer<typeof productByIdInput>;
export type BrandsInput = z.infer<typeof brandsInput>;
export type TypesInput = z.infer<typeof typesInput>;
