import type { ShoppingCartResponse, Cart } from './types';

/**
 * Mock backend response (camelCase - matches actual API response)
 */
export const mockShoppingCartResponse: ShoppingCartResponse = {
  userName: 'guest',
  items: [
    {
      productId: 'prod-101',
      productName: 'iPhone X',
      price: 999,
      originalPrice: 999,
      discountAmount: 0,
      quantity: 1,
      imageFile: '/images/iphone-x.jpg',
    },
    {
      productId: 'prod-102',
      productName: 'Samsung S21',
      price: 799,
      originalPrice: 899,
      discountAmount: 100,
      quantity: 1,
      imageFile: '/images/samsung-s21.jpg',
    },
  ],
  totalPrice: 1798,
};

export const mockEmptyShoppingCartResponse: ShoppingCartResponse = {
  userName: 'guest',
  items: [],
  totalPrice: 0,
};

/**
 * Mock frontend DTO (camelCase - for React components)
 */
export const mockCart: Cart = {
  userName: 'guest',
  items: [
    {
      productId: 'prod-101',
      productName: 'iPhone X',
      price: 999,
      originalPrice: 999,
      discountAmount: 0,
      quantity: 1,
      imageFile: '/images/iphone-x.jpg',
      itemTotal: 999,
    },
    {
      productId: 'prod-102',
      productName: 'Samsung S21',
      price: 799,
      originalPrice: 899,
      discountAmount: 100,
      quantity: 1,
      imageFile: '/images/samsung-s21.jpg',
      itemTotal: 799,
    },
  ],
  totalPrice: 1798,
  itemCount: 2,
  isEmpty: false,
};

export const mockEmptyCart: Cart = {
  userName: 'guest',
  items: [],
  totalPrice: 0,
  itemCount: 0,
  isEmpty: true,
};

// ====================================
// DEPRECATED - Keep for backward compatibility
// ====================================

/** @deprecated Use mockShoppingCartResponse */
export const mockCartResponse = mockShoppingCartResponse;

/** @deprecated Use mockEmptyShoppingCartResponse */
export const mockEmptyCartResponse = mockEmptyShoppingCartResponse;
