import * as products from './products/apis';

/**
 * Store API Client
 *
 * Centralized client for all store-related API services.
 * Each service exports API functions for specific domain operations.
 *
 * Current services:
 * - products: Product catalog operations (list, detail, brands, types)
 *
 * Planned services:
 * - cart: Shopping cart operations (add, remove, update quantities)
 * - orders: Order management (create, list, track)
 * - reviews: Product review operations (submit, list)
 * - wishlist: User wishlist operations (add, remove)
 */
export const storeClient = {
  products,
  // TODO: Add cart service for shopping cart operations
  // TODO: Add orders service for order management
  // TODO: Add reviews service for product review operations
  // TODO: Add wishlist service for user wishlist management
};
