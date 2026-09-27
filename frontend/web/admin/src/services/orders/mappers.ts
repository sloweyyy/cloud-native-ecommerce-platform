import { createMapper } from '../factory/createMapper';
import {
  Order,
  OrderItem,
  OrderResponse,
  OrderItemResponse,
} from './types';
import {
  orderResponseSchema,
  orderItemResponseSchema,
} from './schemas';

// Mapper for single order item
export const orderItemMapper = createMapper<OrderItemResponse, OrderItem>(
  (response) => {
    const itemTotal = response.price * response.quantity;
    return {
      productId: response.productId,
      productName: response.productName,
      price: response.price,
      quantity: response.quantity,
      imageFile: response.imageFile ?? undefined,
      itemTotal,
    };
  },
  orderItemResponseSchema
);

// Mapper for single order
export const orderMapper = createMapper<OrderResponse, Order>(
  (response) => {
    const items = response.items || [];
    const mappedItems = orderItemMapper.toListDto(items);
    const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: response.id,
      userName: response.userName ?? undefined,
      totalPrice: response.totalPrice ?? undefined,
      orderDate: response.orderDate ?? undefined,
      status: response.status ?? undefined,
      items: mappedItems,
      totalItems,
      firstName: response.firstName ?? undefined,
      lastName: response.lastName ?? undefined,
      emailAddress: response.emailAddress ?? undefined,
      addressLine: response.addressLine ?? undefined,
      country: response.country ?? undefined,
      state: response.state ?? undefined,
      zipCode: response.zipCode ?? undefined,
    };
  },
  orderResponseSchema
);
