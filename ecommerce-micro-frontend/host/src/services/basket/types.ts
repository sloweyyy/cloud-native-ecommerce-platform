import { z } from 'zod';
import {
  shoppingCartItemResponseSchema,
  shoppingCartResponseSchema,
  basketItemSchema,
  basketSchema,
} from './schemas';

// ====================================
// BACKEND RESPONSE TYPES (PascalCase)
// ====================================

export type ShoppingCartItemResponse = z.infer<
  typeof shoppingCartItemResponseSchema
>;
export type ShoppingCartResponse = z.infer<typeof shoppingCartResponseSchema>;

// ====================================
// FRONTEND DTO TYPES (camelCase)
// ====================================

export type BasketItem = z.infer<typeof basketItemSchema>;
export type Basket = z.infer<typeof basketSchema>;
