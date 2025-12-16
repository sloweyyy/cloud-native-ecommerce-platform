/**
 * Orders API Service
 * Integrates with backend Order API endpoints
 */

import { axiosClient } from '../httpClient';
import { API_CONFIG } from '../../config';
import { AuthService } from '../../auth';
import { mapOrder } from './mappers';
import { orderResponseSchema } from './schemas';
import type {
  GetOrdersRequest,
  GetOrderByIdRequest,
  OrderResponse,
  Order,
} from './types';

/**
 * Get orders for current user
 */
export async function getOrders(
  request?: { params?: GetOrdersRequest }
): Promise<{ data: Order[] } | null> {
  const userName =
    request?.params?.userName || AuthService.getCurrentUsername() || 'guest';
  const url = API_CONFIG.ORDER.GET_ORDERS(userName);

  try {
    const response = await axiosClient.get<OrderResponse[]>(url);

    // Handle empty responses
    if (!response.data || response.data.length === 0) {
      return { data: [] };
    }

    // Validate and transform each order
    const orders: Order[] = [];
    for (const orderResponse of response.data) {
      const validatedData = orderResponseSchema.parse(orderResponse);
      const order = mapOrder(validatedData);
      if (order) {
        orders.push(order);
      }
    }

    return { data: orders };
  } catch (error) {
    // Return empty array if orders don't exist (404)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;
    if (status === 404) {
      console.log('[Orders API] No orders found (404), returning empty array');
      return { data: [] };
    }

    // Log other errors
    console.error('[Orders API] Error fetching orders:', error);
    return { data: [] };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(
  request: { params: GetOrderByIdRequest }
): Promise<{ data: Order } | null> {
  const { orderId } = request.params;
  // TODO: Add GET_ORDER_BY_ID endpoint to API_CONFIG when available
  // For now, we'll fetch all orders and filter
  const ordersResult = await getOrders();
  const orders = ordersResult?.data || [];
  const order = orders.find((o) => o.id.toString() === orderId);

  if (!order) {
    return null;
  }

  return { data: order };
}

