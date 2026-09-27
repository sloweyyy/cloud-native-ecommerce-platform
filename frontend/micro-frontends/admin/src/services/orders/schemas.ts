import { z } from 'zod';

export const orderItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
});

export const orderResponseSchema = z.object({
  id: z.number(),
  userName: z.string().optional().nullable(),
  totalPrice: z.number().optional().nullable(),
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
  orderDate: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  items: z.array(orderItemResponseSchema).optional().nullable(),
});

export const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  imageFile: z.string().optional().nullable(),
  itemTotal: z.number().optional(),
});

export const orderSchema = z.object({
  id: z.number(),
  userName: z.string().optional().nullable(),
  totalPrice: z.number().optional().nullable(),
  orderDate: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  items: z.array(orderItemSchema).optional(),
  totalItems: z.number().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  emailAddress: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});

export const updateOrderInputSchema = z.object({
  id: z.number(),
  userName: z.string().optional(),
  totalPrice: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailAddress: z.string().optional(),
  addressLine: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiration: z.string().optional(),
  cvv: z.string().optional(),
  paymentMethod: z.number().optional(),
});
