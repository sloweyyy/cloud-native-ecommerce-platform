/**
 * Checkout Module - Zod Schemas for Backend DTOs
 */

import { z } from 'zod';

// Basket Schemas
export const ShoppingCartItemSchema = z.object({
  Quantity: z.number().int().min(1),
  Price: z.number(),
  OriginalPrice: z.number(),
  DiscountAmount: z.number().default(0),
  ProductId: z.string(),
  ImageFile: z.string().optional(),
  ProductName: z.string(),
});

export const ShoppingCartSchema = z.object({
  UserName: z.string(),
  Items: z.array(ShoppingCartItemSchema).default([]),
});

export const ShoppingCartResponseSchema = ShoppingCartSchema.extend({
  TotalPrice: z.number().optional(),
});

// Create Basket Command
export const CreateShoppingCartCommandSchema = z.object({
  UserName: z.string().min(1, 'Username is required'),
  Items: z.array(ShoppingCartItemSchema),
});

// Checkout Commands
export const CheckoutBasketCommandSchema = z.object({
  UserName: z.string().min(1, 'Username is required'),
  TotalPrice: z.number().min(0),
  FirstName: z.string().optional(),
  LastName: z.string().optional(),
  EmailAddress: z.string().email().optional(),
  AddressLine: z.string().optional(),
  Country: z.string().optional(),
  State: z.string().optional(),
  ZipCode: z.string().optional(),
  CardName: z.string().optional(),
  CardNumber: z.string().optional(),
  Expiration: z.string().optional(),
  CVV: z.string().optional(),
  PaymentMethod: z.number().optional(),
});

// Discount Schemas
export const CouponSchema = z.object({
  Id: z.number(),
  ProductName: z.string(),
  Description: z.string(),
  Amount: z.number().int().min(0),
});

