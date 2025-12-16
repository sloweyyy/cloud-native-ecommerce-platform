import { z } from 'zod';
import {
  shoppingCartItemResponseSchema,
  shoppingCartResponseSchema,
  basketItemSchema,
  basketSchema,
  addToCartRequestSchema,
} from './schemas';

// ============================================================================
// Backend Response Types
// ============================================================================

export type ShoppingCartItemResponse = z.infer<typeof shoppingCartItemResponseSchema>;
export type ShoppingCartResponse = z.infer<typeof shoppingCartResponseSchema>;

// ============================================================================
// Frontend DTO Types
// ============================================================================

export type BasketItem = z.infer<typeof basketItemSchema>;
export type Basket = z.infer<typeof basketSchema>;

// ============================================================================
// Request Types
// ============================================================================

export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>;

export type GetBasketRequest = {
  userName?: string;
};

