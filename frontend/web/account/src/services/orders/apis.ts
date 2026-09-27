import { z } from 'zod';
import { createApiFactory } from '../factory/createApiFactory';
import { mapOrder } from './mappers';
import { orderResponseSchema } from './schemas';
import type { GetOrdersInput } from './input';
import type { OrderResponse, Order } from './types';

export const apiFactory = createApiFactory('/Order', { version: '' });

export async function getOrders(request?: {
  params?: GetOrdersInput;
}): Promise<{ data: Order[] } | null> {
  const userName = request?.params?.userName || 'guest';

  try {
    const result = await apiFactory<OrderResponse[], Order[]>(
      'GET',
      `/:userName`,
      { params: { ...request?.params, userName } },
      {
        transformer: (response) => {
          if (!response || !Array.isArray(response)) {
            return [];
          }
          const orders: Order[] = [];
          for (const orderResponse of response) {
            const validatedData = orderResponseSchema.parse(orderResponse);
            const order = mapOrder(validatedData);
            if (order) {
              orders.push(order);
            }
          }
          return orders;
        },
        responseSchema: z.array(orderResponseSchema),
        useMock: request?.params?.useMock ?? false,
      }
    );

    return result ?? { data: [] };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404) {
      console.log('[Orders API] No orders found (404), returning empty array');
      return { data: [] };
    }

    console.error('[Orders API] Error fetching orders:', error);
    return { data: [] };
  }
}
