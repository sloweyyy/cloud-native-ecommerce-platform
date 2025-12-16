import { z } from 'zod';

// ====================================
// REQUEST SCHEMAS
// ====================================

export const getCartRequestSchema = z.object({
  userName: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const addToCartRequestSchema = z.object({
  productId: z.string(),
  productName: z.string().min(1).max(200),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  quantity: z.number().min(1).max(99),
  imageFile: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const updateCartItemRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0).max(99),
  useMock: z.boolean().optional(),
});

export const removeCartItemRequestSchema = z.object({
  productId: z.string(),
  useMock: z.boolean().optional(),
});

export const clearCartRequestSchema = z.object({
  userName: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const checkoutRequestSchema = z.object({
  totalPrice: z.number().min(0),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailAddress: z.string().email().optional(),
  addressLine: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiration: z.string().optional(),
  cvv: z.string().optional(),
  paymentMethod: z.number().optional(),
  useMock: z.boolean().optional(),
});

// ====================================
// BACKEND RESPONSE SCHEMAS (camelCase - actual API response)
// ====================================

/**
 * Backend ShoppingCartItem response schema
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
 * Backend ShoppingCart response schema
 * Matches actual API response from /Basket/GetBasket
 */
export const shoppingCartResponseSchema = z.object({
  userName: z.string(),
  items: z.array(shoppingCartItemResponseSchema).default([]),
  totalPrice: z.number().optional(),
});

// ====================================
// FRONTEND DTO SCHEMAS (camelCase for React)
// ====================================

/**
 * Frontend CartItem DTO schema
 */
export const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number(),
  discountAmount: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
  itemTotal: z.number().optional(),
});

/**
 * Frontend Cart DTO schema
 */
export const cartSchema = z.object({
  userName: z.string(),
  items: z.array(cartItemSchema),
  totalPrice: z.number(),
  itemCount: z.number().optional(),
  isEmpty: z.boolean().optional(),
});

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use shoppingCartItemResponseSchema */
export const cartItemResponseSchema = shoppingCartItemResponseSchema;

/** @deprecated Use shoppingCartResponseSchema */
export const cartResponseSchema = shoppingCartResponseSchema;

/** @deprecated Use checkoutRequestSchema */
export const applyShippingRequestSchema = z.object({
  shippingMethod: z.enum(['standard', 'express']),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  useMock: z.boolean().optional(),
});
