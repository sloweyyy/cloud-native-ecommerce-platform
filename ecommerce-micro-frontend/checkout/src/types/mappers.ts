/**
 * Checkout Module - Type Mappers
 */

import type { z } from 'zod';
import type {
  ShoppingCartSchema,
  ShoppingCartItemSchema,
  ShoppingCartResponseSchema,
  CouponSchema,
} from './schemas';

// Backend types (PascalCase)
export type ShoppingCart = z.infer<typeof ShoppingCartSchema>;
export type ShoppingCartItem = z.infer<typeof ShoppingCartItemSchema>;
export type ShoppingCartResponse = z.infer<typeof ShoppingCartResponseSchema>;
export type Coupon = z.infer<typeof CouponSchema>;

// Frontend types (camelCase)
export interface ShoppingCartItemFrontend {
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  productId: string;
  imageFile?: string;
  productName: string;
}

export interface ShoppingCartFrontend {
  userName: string;
  items: ShoppingCartItemFrontend[];
  totalPrice?: number;
}

export interface CouponFrontend {
  id: number;
  productName: string;
  description: string;
  amount: number;
}

// Mappers: Backend PascalCase -> Frontend camelCase
export const mapShoppingCartToFrontend = (cart: ShoppingCartResponse): ShoppingCartFrontend => ({
  userName: cart.UserName,
  items: cart.Items.map(mapShoppingCartItemToFrontend),
  totalPrice: cart.TotalPrice,
});

export const mapShoppingCartItemToFrontend = (item: ShoppingCartItem): ShoppingCartItemFrontend => ({
  quantity: item.Quantity,
  price: item.Price,
  originalPrice: item.OriginalPrice,
  discountAmount: item.DiscountAmount,
  productId: item.ProductId,
  imageFile: item.ImageFile,
  productName: item.ProductName,
});

export const mapCouponToFrontend = (coupon: Coupon): CouponFrontend => ({
  id: coupon.Id,
  productName: coupon.ProductName,
  description: coupon.Description,
  amount: coupon.Amount,
});

// Mappers: Frontend camelCase -> Backend PascalCase
export const mapShoppingCartItemToBackend = (item: ShoppingCartItemFrontend): ShoppingCartItem => ({
  Quantity: item.quantity,
  Price: item.price,
  OriginalPrice: item.originalPrice,
  DiscountAmount: item.discountAmount,
  ProductId: item.productId,
  ImageFile: item.imageFile,
  ProductName: item.productName,
});

export const mapShoppingCartToBackend = (cart: ShoppingCartFrontend): ShoppingCart => ({
  UserName: cart.userName,
  Items: cart.items.map(mapShoppingCartItemToBackend),
});

