import { z, ZodType } from 'zod';

const paginationMetaSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
});

export const createApiResponseSchemaFactory = <T>(dataSchema: ZodType<T>) => {
  return z.object({
    data: dataSchema,
    meta: paginationMetaSchema.optional(),
  });
};

