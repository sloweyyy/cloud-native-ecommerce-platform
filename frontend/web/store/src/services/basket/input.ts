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

export type GetBasketInput = z.infer<typeof getBasketInput>;
export type AddToCartInput = z.infer<typeof addToCartInput>;
