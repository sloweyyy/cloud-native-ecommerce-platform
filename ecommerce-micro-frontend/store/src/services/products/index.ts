// Export all types
export type * from './types';

// Export input types (needed by consumers for params)
export type { StoreParamsInput, ProductByIdInput } from './input';

// Export hooks (primary way to interact with products service)
export * from './hooks';

// Export cache keys for query invalidation
export * from './keys';

// Export only necessary schemas for external validation
export {
  productSchema,
  brandSchema,
  productTypeSchema,
  reviewSchema,
  stockStatusEnum,
} from './schemas';
