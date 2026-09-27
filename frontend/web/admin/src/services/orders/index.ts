// Export all types
export type * from './types';

// Export input types (needed by consumers for params)
export type {
  OrdersParamsInput,
  OrderByIdInput,
  UpdateOrderInput,
} from './input';

// Export hooks (primary way to interact with service)
export * from './hooks';

// Export cache keys for query invalidation
export * from './keys';

// Export only necessary schemas for external validation
export {
  orderSchema,
  orderItemSchema,
  orderResponseSchema,
  orderItemResponseSchema,
} from './schemas';
