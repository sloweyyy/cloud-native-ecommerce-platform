import { z } from 'zod';
import {
  getCartRequestSchema,
  addToCartRequestSchema,
  updateCartItemRequestSchema,
  removeCartItemRequestSchema,
  clearCartRequestSchema,
  checkoutRequestSchema,
  shoppingCartItemResponseSchema,
  shoppingCartResponseSchema,
  cartItemSchema,
  cartSchema,
} from './schemas';

// ====================================
// REQUEST TYPES
// ====================================

export type GetCartRequest = z.infer<typeof getCartRequestSchema>;
export type AddToCartRequest = z.infer<typeof addToCartRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;
export type RemoveCartItemRequest = z.infer<typeof removeCartItemRequestSchema>;
export type ClearCartRequest = z.infer<typeof clearCartRequestSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

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

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use ShoppingCartItemResponse */
export type CartItemResponse = ShoppingCartItemResponse;

/** @deprecated Use ShoppingCartResponse */
export type CartResponse = ShoppingCartResponse;

/** @deprecated Use CheckoutRequest */
export type ApplyShippingRequest = {
  shippingMethod: 'standard' | 'express';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  useMock?: boolean;
};
