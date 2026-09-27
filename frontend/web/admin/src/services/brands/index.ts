// Export all types
export type * from './types';

// Export input types (needed by consumers for params)
export type {
  CreateBrandInput,
  CreateTypeInput,
} from './input';

// Export hooks (primary way to interact with service)
export * from './hooks';

// Export cache keys for query invalidation
export * from './keys';

// Export only necessary schemas for external validation
export {
  brandResponseSchema,
  typeResponseSchema,
} from './schemas';
