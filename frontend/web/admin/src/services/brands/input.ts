import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for create brand operation
export const createBrandInput = createApiInputFactory(
  z.object({
    name: z.string().min(1, 'Brand name is required'),
  })
);

// Input for create type operation
export const createTypeInput = createApiInputFactory(
  z.object({
    name: z.string().min(1, 'Type name is required'),
  })
);

// Export inferred types
export type CreateBrandInput = z.infer<typeof createBrandInput>;
export type CreateTypeInput = z.infer<typeof createTypeInput>;

