import { z } from 'zod';

export const baseSearchSchema = z.object({
  page: z.coerce.number().min(1).optional().catch(1),
});

export const productListSearchSchema = baseSearchSchema.extend({
  brandId: z.string().optional().catch(undefined),
  typeId: z.string().optional().catch(undefined),
  cat: z
    .string()
    .optional()
    .catch(undefined)
    .transform((val) => {
      if (!val || typeof val !== 'string' || val.trim() === '') {
        return undefined;
      }
      return val.trim();
    }),
  sort: z
    .enum(['priceAsc', 'priceDesc', 'nameAsc', 'nameDesc', 'default'])
    .optional()
    .catch('default'),
  filter: z.enum(['all']).optional().catch('all'),
});

export type BaseSearchParams = z.infer<typeof baseSearchSchema>;
export type ProductListSearch = z.infer<typeof productListSearchSchema>;

export const getRouteSearchParams = {
  '/': (search: Record<string, unknown>): ProductListSearch => ({
    page: (search.page as number) || 1,
    brandId: search.brandId as string | undefined,
    typeId: search.typeId as string | undefined,
    cat: search.cat as string | undefined,
    sort: (search.sort as ProductListSearch['sort']) || 'default',
    filter: (search.filter as ProductListSearch['filter']) || 'all',
  }),
} as const;
