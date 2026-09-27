import { z } from 'zod';

import { SortOrder } from '../types';

export const createApiInputFactory = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
) => {
  return z.object({
    ...dataSchema.shape,
    page: z.number().optional(),
    limit: z.number().optional(),
    orderBy: z.record(z.string(), z.nativeEnum(SortOrder)).optional(),
    useMock: z.boolean().optional(),
  });
};

