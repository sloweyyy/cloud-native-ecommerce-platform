import { z } from 'zod';
import {
  orderResponseSchema,
  orderItemResponseSchema,
  orderSchema,
  orderItemSchema,
} from './schemas';

// Response types (from API)
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderItemResponse = z.infer<typeof orderItemResponseSchema>;

// DTO types (for application use)
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

// Re-export input types from input.ts
export type {
  OrdersParamsInput,
  OrderByIdInput,
  UpdateOrderInput,
} from './input';
