import { z } from 'zod';
import {
  orderItemResponseSchema,
  orderResponseSchema,
  orderItemSchema,
  orderSchema,
} from './schemas';

// ====================================
// BACKEND RESPONSE TYPES
// ====================================

export type OrderItemResponse = z.infer<typeof orderItemResponseSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;

// ====================================
// FRONTEND DTO TYPES (camelCase)
// ====================================

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;

