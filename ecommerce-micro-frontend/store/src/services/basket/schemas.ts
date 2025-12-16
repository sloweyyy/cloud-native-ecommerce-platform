import { z } from 'zod';

// ============================================================================
// Backend Response Schemas (camelCase - matching actual API response)
// ============================================================================

/**
 * Backend ShoppingCartItem Schema
 * Matches /Basket/GetBasket response item structure
 */
export const shoppingCartItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number().optional().default(0),
  discountAmount: z.number().optional().default(0),
  quantity: z.number(),
  imageFile: z.string().nullable().optional(),
  finalPrice: z.number().optional(),
});

/**
 * Backend ShoppingCart Schema
 * Matches /Basket/GetBasket and /Basket/CreateBasket response structure
 */
export const shoppingCartResponseSchema = z.object({
  userName: z.string(),
  items: z.array(shoppingCartItemResponseSchema).default([]),
  totalPrice: z.number().optional(),
});

// ============================================================================
// Frontend DTO Schemas (same as backend since both use camelCase)
// ============================================================================

/**
 * Frontend BasketItem DTO Schema
 */
export const basketItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number(),
  discountAmount: z.number(),
  quantity: z.number(),
  imageFile: z.string().nullable().optional(),
  itemTotal: z.number(),
});

/**
 * Frontend Basket DTO Schema
 */
export const basketSchema = z.object({
  userName: z.string(),
  items: z.array(basketItemSchema),
  totalPrice: z.number(),
  itemCount: z.number(),
  isEmpty: z.boolean(),
});

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Add to cart request schema
 */
export const addToCartRequestSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  quantity: z.number().min(1),
  imageFile: z.string().nullable().optional(),
});
