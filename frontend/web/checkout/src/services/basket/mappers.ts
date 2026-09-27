import { createMapper } from '../factory/createMapper';
import { ZodSchema } from 'zod';

import {
  Basket,
  BasketItem,
  BasketItemResponse,
  BasketResponse,
  basketItemResponseSchema,
  basketResponseSchema,
} from './schemas';

export const basketItemMapper = createMapper<BasketItemResponse, BasketItem>(
  (entity) => {
    return {
      productId: entity.productId,
      productName: entity.productName,
      price: entity.price,
      originalPrice: entity.originalPrice ?? entity.price,
      discountAmount: entity.discountAmount ?? 0,
      quantity: entity.quantity,
      imageFile: entity.imageFile ?? null,
      itemTotal: entity.price * entity.quantity,
    };
  },
  basketItemResponseSchema as ZodSchema<BasketItemResponse>
);

export const basketMapper = createMapper<BasketResponse, Basket>((entity) => {
  const items = (entity.items || []).map((item) => ({
    productId: item.productId,
    productName: item.productName,
    price: item.price,
    originalPrice: item.originalPrice ?? item.price,
    discountAmount: item.discountAmount ?? 0,
    quantity: item.quantity,
    imageFile: item.imageFile ?? null,
    itemTotal: item.price * item.quantity,
  }));

  const totalPrice =
    entity.totalPrice ?? items.reduce((sum, item) => sum + item.itemTotal, 0);

  return {
    userName: entity.userName,
    items,
    totalPrice,
    itemCount: items.length,
    isEmpty: items.length === 0,
  };
}, basketResponseSchema as ZodSchema<BasketResponse>);

