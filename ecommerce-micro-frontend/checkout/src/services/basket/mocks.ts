/**
 * Basket Mock Data
 * Used when NX_USE_MOCK_DATA=true in environment
 */

import type { ShoppingCartFrontend } from '../../types';

export function getMockBasket(): ShoppingCartFrontend {
  return {
    userName: 'demo-user',
    items: [
      {
        quantity: 2,
        price: 950.0,
        originalPrice: 950.0,
        discountAmount: 0,
        productId: 'mock-product-1',
        imageFile: '/assets/products/iphone-x.png',
        productName: 'iPhone X',
      },
      {
        quantity: 1,
        price: 1200.0,
        originalPrice: 1200.0,
        discountAmount: 0,
        productId: 'mock-product-2',
        imageFile: '/assets/products/macbook-pro.png',
        productName: 'MacBook Pro',
      },
    ],
    totalPrice: 3100.0,
  };
}

export function getMockCheckoutResponse(): {
  success: boolean;
  orderId: number;
} {
  return {
    success: true,
    orderId: Math.floor(Math.random() * 10000),
  };
}
