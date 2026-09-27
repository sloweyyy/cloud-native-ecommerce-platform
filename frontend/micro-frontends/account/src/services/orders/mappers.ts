import type {
  OrderResponse,
  OrderItemResponse,
  Order,
  OrderItem,
} from './types';
import { orderResponseSchema, orderItemResponseSchema } from './schemas';

/**
 * Map backend OrderItem to frontend OrderItem
 * Note: Backend returns camelCase
 */
export function mapOrderItem(
  response: OrderItemResponse
): OrderItem | null {
  // Validate with Zod schema
  const parseResult = orderItemResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Order Mapper] Invalid order item:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const itemTotal = data.price * data.quantity;

  return {
    productId: data.productId,
    productName: data.productName,
    price: data.price,
    quantity: data.quantity,
    imageFile: data.imageFile,
    itemTotal,
  };
}

/**
 * Map backend Order to frontend Order
 * Note: Backend returns camelCase
 */
export function mapOrder(response: OrderResponse): Order | null {
  // Validate with Zod schema
  const parseResult = orderResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[Order Mapper] Invalid order response:', parseResult.error);
    return null;
  }

  const data = parseResult.data;
  const items = data.items || [];
  const mappedItems: OrderItem[] = [];

  for (const item of items) {
    const mappedItem = mapOrderItem(item);
    if (mappedItem !== null) {
      mappedItems.push(mappedItem);
    }
  }

  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: data.id,
    userName: data.userName,
    totalPrice: data.totalPrice,
    orderDate: data.orderDate,
    status: data.status,
    items: mappedItems,
    totalItems,
    firstName: data.firstName,
    lastName: data.lastName,
    emailAddress: data.emailAddress,
    addressLine: data.addressLine,
    country: data.country,
    state: data.state,
    zipCode: data.zipCode,
    cardName: data.cardName,
    cardNumber: data.cardNumber,
    expiration: data.expiration,
    cvv: data.cvv,
    paymentMethod: data.paymentMethod,
  };
}

// ====================================
// Mapper object for compatibility with createMapper pattern
// ====================================

export const orderItemMapper = {
  toDto: mapOrderItem,
  toListDto: (items: OrderItemResponse[] | null | undefined) => {
    if (!items || items.length === 0) {
      return [];
    }
    return items
      .map(mapOrderItem)
      .filter((item): item is OrderItem => item !== null);
  },
};

export const orderMapper = {
  toDto: mapOrder,
  toListDto: (orders: OrderResponse[] | null | undefined) => {
    if (!orders || orders.length === 0) {
      return [];
    }
    return orders.map(mapOrder).filter((order): order is Order => order !== null);
  },
};

