import { z } from 'zod';

export const productListSearchSchema = z.object({
  typeId: z.string().optional().catch(undefined),
  cat: z.string().optional().catch(undefined),
  sort: z
    .enum(['priceAsc', 'priceDesc', 'nameAsc', 'nameDesc', 'default'])
    .optional()
    .catch('default'),
  filter: z
    .enum(['all', 'new-arrivals', 'best-seller'])
    .optional()
    .catch('all'),
  page: z.coerce.number().min(1).optional().catch(1),
});

export type ProductListSearch = z.infer<typeof productListSearchSchema>;

