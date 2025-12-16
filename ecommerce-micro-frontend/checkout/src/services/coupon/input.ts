import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

export const listCouponsInput = createApiInputFactory(
  z.object({
    productId: z.string().optional(),
    categoryId: z.string().optional(),
    userId: z.string().optional(),
    isActive: z.boolean().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    sortBy: z.enum(['createdAt', 'amount', 'expiryDate']).optional(),
    useMock: z.boolean().optional(),
  })
);

export const getUserCouponsInput = createApiInputFactory(
  z.object({
    userId: z.string(),
    status: z.enum(['available', 'used', 'expired', 'all']).optional(),
    useMock: z.boolean().optional(),
  })
);

export type ListCouponsInput = z.infer<typeof listCouponsInput>;
export type GetUserCouponsInput = z.infer<typeof getUserCouponsInput>;
