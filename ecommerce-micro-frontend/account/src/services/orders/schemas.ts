import { z } from 'zod';

// ====================================
// REQUEST SCHEMAS
// ====================================

export const getOrdersRequestSchema = z.object({
  userName: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const getOrderByIdRequestSchema = z.object({
  orderId: z.string(),
  useMock: z.boolean().optional(),
});

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
  orderDate: z.string(),
  status: z.string().optional().nullable(),
  items: z.array(orderItemResponseSchema).default([]),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
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
  orderDate: z.string(),
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
});

