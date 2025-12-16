import { z } from 'zod';

/**
 * Backend ShoppingCartItem response schema (camelCase)
 * Matches actual API response from /Basket/GetBasket
 */
export const shoppingCartItemResponseSchema = z.object({
  quantity: z.number().int().min(1),
  price: z.number(),
  originalPrice: z.number(),
  discountAmount: z.number().default(0),
  productId: z.string(),
  imageFile: z.string().optional().nullable(),
  productName: z.string(),
  finalPrice: z.number().optional(),
});

/**
 * Backend ShoppingCart response schema (camelCase)
 * Matches actual API response from /Basket/GetBasket
 */
export const shoppingCartResponseSchema = z.object({
  userName: z.string(),
  items: z.array(shoppingCartItemResponseSchema).default([]),
  totalPrice: z.number().optional(),
});

/**
 * Frontend BasketItem DTO schema
 */
export const basketItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number(),
  discountAmount: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
  itemTotal: z.number(),
});

/**
 * Frontend Basket DTO schema
 */
export const basketSchema = z.object({
  userName: z.string(),
  items: z.array(basketItemSchema),
  totalPrice: z.number(),
  itemCount: z.number(),
  isEmpty: z.boolean(),
});
