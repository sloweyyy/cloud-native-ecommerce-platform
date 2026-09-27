import { z } from 'zod';

import { createApiInputFactory } from '../factory/createApiInputFactory';

export const getBasketInput = createApiInputFactory(
  z.object({
    userName: z.string(),
  })
);

export const addToCartInput = createApiInputFactory(
  z.object({
    UserName: z.string().min(1, 'Username is required'),
    Items: z.array(
      z.object({
        Quantity: z.number().int().min(1),
        Price: z.number(),
        OriginalPrice: z.number(),
        DiscountAmount: z.number().default(0),
        ProductId: z.string(),
        ImageFile: z.string().optional(),
        ProductName: z.string(),
      })
    ),
  })
);

export const updateBasketItemInput = createApiInputFactory(
  z.object({
    productId: z.string(),
    quantity: z.number().int().min(0),
  })
);

export const removeBasketItemInput = createApiInputFactory(
  z.object({
    productId: z.string(),
  })
);

export const checkoutInput = createApiInputFactory(
  z.object({
    totalPrice: z.number(),
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
  })
);

export type GetBasketInput = z.infer<typeof getBasketInput>;
export type AddToCartInput = z.infer<typeof addToCartInput>;
export type UpdateBasketItemInput = z.infer<typeof updateBasketItemInput>;
export type RemoveBasketItemInput = z.infer<typeof removeBasketItemInput>;
export type CheckoutInput = z.infer<typeof checkoutInput>;

