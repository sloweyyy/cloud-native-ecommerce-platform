import type {
  ShoppingCartResponse,
  ShoppingCartItemResponse,
  Cart,
  CartItem,
} from './types';
import {
  shoppingCartResponseSchema,
  shoppingCartItemResponseSchema,
} from './schemas';

/**
 * Map backend ShoppingCartItem to frontend CartItem
 * Note: Backend returns camelCase
 */
export function mapCartItem(
  response: ShoppingCartItemResponse
): CartItem | null {
  // Validate with Zod schema
  const parseResult = shoppingCartItemResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Cart Mapper] Invalid cart item:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const itemTotal = data.price * data.quantity;

  return {
    productId: data.productId,
    productName: data.productName,
    price: data.price,
    originalPrice: data.originalPrice,
    discountAmount: data.discountAmount,
    quantity: data.quantity,
    imageFile: data.imageFile,
    itemTotal,
  };
}

/**
 * Map backend ShoppingCart to frontend Cart
 * Note: Backend returns camelCase
 */
export function mapCart(response: ShoppingCartResponse): Cart | null {
  // Validate with Zod schema
  const parseResult = shoppingCartResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Cart Mapper] Invalid cart response:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const items = data.items || [];
  const mappedItems: CartItem[] = [];

  for (const item of items) {
    const mappedItem = mapCartItem(item);
    if (mappedItem !== null) {
      mappedItems.push(mappedItem);
    }
  }

  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = mappedItems.length === 0;

  // Calculate total if not provided
  const totalPrice =
    data.totalPrice ??
    mappedItems.reduce((sum, item) => sum + (item.itemTotal ?? 0), 0);

  return {
    userName: data.userName,
    items: mappedItems,
    totalPrice,
    itemCount,
    isEmpty,
  };
}

// ====================================
// Mapper object for compatibility with createMapper pattern
// ====================================

export const cartItemMapper = {
  toDto: mapCartItem,
  toListDto: (items: ShoppingCartItemResponse[] | null | undefined) => {
    if (!items || items.length === 0) {
      return [];
    }
    return items
      .map(mapCartItem)
      .filter((item): item is CartItem => item !== null);
  },
};

export const cartMapper = {
  toDto: mapCart,
  toListDto: (carts: ShoppingCartResponse[] | null | undefined) => {
    if (!carts || carts.length === 0) {
      return [];
    }
    return carts.map(mapCart).filter((cart): cart is Cart => cart !== null);
  },
};
