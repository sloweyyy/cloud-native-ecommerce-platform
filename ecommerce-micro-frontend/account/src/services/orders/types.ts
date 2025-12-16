import { z } from 'zod';
import {
  getOrdersRequestSchema,
  getOrderByIdRequestSchema,
  orderItemResponseSchema,
  orderResponseSchema,
  orderItemSchema,
  orderSchema,
} from './schemas';

// ====================================
// REQUEST TYPES
// ====================================

export type GetOrdersRequest = z.infer<typeof getOrdersRequestSchema>;
export type GetOrderByIdRequest = z.infer<typeof getOrderByIdRequestSchema>;

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

