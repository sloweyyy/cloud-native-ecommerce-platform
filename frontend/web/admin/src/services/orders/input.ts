import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for list orders by userName
export const ordersParamsInput = createApiInputFactory(
  z.object({
    userName: z.string().min(1, 'userName is required'),
  })
);

// Input for single order by ID
export const orderByIdInput = createApiInputFactory(
  z.object({
    id: z.number(),
  })
);

// Input for update order operation
export const updateOrderInput = createApiInputFactory(
  z.object({
    id: z.number(),
    userName: z.string().optional(),
    totalPrice: z.number().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    emailAddress: z.string().optional(),
    addressLine: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiration: z.string().optional(),
    cvv: z.string().optional(),
    paymentMethod: z.number().optional(),
  })
);

// Export inferred types
export type OrdersParamsInput = z.infer<typeof ordersParamsInput>;
export type OrderByIdInput = z.infer<typeof orderByIdInput>;
export type UpdateOrderInput = z.infer<typeof updateOrderInput>;

