import { z } from 'zod';

// ====================================
// BACKEND RESPONSE SCHEMAS (camelCase - actual API response)
// ====================================

/**
 * Backend OrderItem response schema
 * Matches actual API response
 */
export const orderItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
});

/**
 * Backend Order response schema
 * Matches actual API response from /Order/GetOrdersByUserName
 */
export const orderResponseSchema = z.object({
  id: z.number(),
  userName: z.string(),
  totalPrice: z.number(),
  orderDate: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  items: z.array(orderItemResponseSchema).optional().default([]),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  cardName: z.string().optional().nullable(),
  cardNumber: z.string().optional().nullable(),
  expiration: z.string().optional().nullable(),
  cvv: z.string().optional().nullable(),
  paymentMethod: z.number().optional().nullable(),
});

// ====================================
// FRONTEND DTO SCHEMAS (camelCase for React)
// ====================================

/**
 * Frontend OrderItem DTO schema
 */
export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
  itemTotal: z.number().optional(),
});

/**
 * Frontend Order DTO schema
 */
export const orderSchema = z.object({
  id: z.number(),
  userName: z.string(),
  totalPrice: z.number(),
  orderDate: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  items: z.array(orderItemSchema),
  totalItems: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  cardName: z.string().optional().nullable(),
  cardNumber: z.string().optional().nullable(),
  expiration: z.string().optional().nullable(),
  cvv: z.string().optional().nullable(),
  paymentMethod: z.number().optional().nullable(),
});

