import { z } from 'zod';

export const basketItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  price: z.number(),
  originalPrice: z.number().optional().default(0),
  discountAmount: z.number().optional().default(0),
  quantity: z.number(),
  imageFile: z.string().nullable().optional(),
  finalPrice: z.number().optional(),
});

export const basketResponseSchema = z.object({
  userName: z.string(),
  items: z.array(basketItemResponseSchema).default([]),
  totalPrice: z.number().optional(),
});

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

export const basketSchema = z.object({
  userName: z.string(),
  items: z.array(basketItemSchema),
  totalPrice: z.number(),
  itemCount: z.number(),
  isEmpty: z.boolean(),
});

export type BasketItemResponse = z.infer<typeof basketItemResponseSchema>;
export type BasketResponse = z.infer<typeof basketResponseSchema>;

export type BasketItem = z.infer<typeof basketItemSchema>;
export type Basket = z.infer<typeof basketSchema>;
