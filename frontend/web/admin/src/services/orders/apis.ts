import { z } from 'zod';
import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestParamsRequired, RequestPayloadRequired } from '../types';
import {
  ordersParamsInput,
  OrdersParamsInput,
  orderByIdInput,
  OrderByIdInput,
  updateOrderInput,
  UpdateOrderInput,
} from './input';
import {
  orderMapper,
} from './mappers';
import {
  Order,
  OrderResponse,
} from './types';
import {
  orderResponseSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Order', { version: 'v1' });

/**
 * Get orders filtered by userName
 *
 * @param request - Request parameters
 * @param request.params.userName - User name to filter orders (required)
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Array of orders for the specified user
 *
 * @example
 * ```typescript
 * const result = await getOrders({
 *   params: {
 *     userName: 'user123',
 *     useMock: true
 *   }
 * });
 * ```
 */
export async function getOrders(request: Request<OrdersParamsInput>) {
  const userName = request?.params?.userName;
  
  if (!userName) {
    throw new Error('userName parameter is required');
  }
  
  return apiFactory<OrderResponse[], Order[]>(
    'GET',
    `/:userName`,
    { ...request, params: { ...request?.params, userName } },
    {
      transformer: (response) => {
        if (!response || !Array.isArray(response)) {
          return [];
        }
        return orderMapper.toListDto(response);
      },
      paramsSchema: ordersParamsInput,
      responseSchema: z.array(orderResponseSchema),
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Update an existing order
 *
 * @param request - Request with order data
 * @param request.payload - Order update data (must include id)
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Updated order
 *
 * @example
 * ```typescript
 * const result = await updateOrder({
 *   payload: {
 *     id: 123,
 *     status: 'shipped'
 *   }
 * });
 * ```
 */
export async function updateOrder(
  request: RequestPayloadRequired<UpdateOrderInput>
) {
  return apiFactory<OrderResponse, Order>(
    'PUT',
    '/UpdateOrder',
    request,
    {
      transformer: orderMapper.toDto,
      paramsSchema: updateOrderInput,
      responseSchema: orderResponseSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

/**
 * Delete an order by ID
 *
 * @param request - Request with order ID
 * @param request.params.id - The order ID to delete
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Success boolean
 *
 * @example
 * ```typescript
 * const result = await deleteOrder({
 *   params: { id: 123, useMock: true }
 * });
 * ```
 */
export async function deleteOrder(
  request: RequestParamsRequired<OrderByIdInput>
) {
  return apiFactory<unknown, boolean>(
    'DELETE',
    `/:id`,
    request,
    {
      transformer: () => true,
      paramsSchema: orderByIdInput,
      responseSchema: z.any(),
      useMock: request?.params?.useMock ?? false,
    }
  );
}
