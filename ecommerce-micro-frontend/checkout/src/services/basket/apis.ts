/**
 * Basket API Service
 * Type-safe API calls for Shopping Cart/Basket operations
 */

import { httpClient } from '../httpClient';
import { env, API_CONFIG } from '../../config';
import { AuthService } from '../../auth';
import {
  ShoppingCartResponseSchema,
  CreateShoppingCartCommandSchema,
  CheckoutBasketCommandSchema,
  mapShoppingCartToFrontend,
  type ShoppingCartResponse,
  type ShoppingCartItem,
  type ShoppingCartFrontend,
} from '../../types';
import { getMockBasket, getMockCheckoutResponse } from './mocks';

/**
 * Get basket for current user
 */
export async function getBasket(): Promise<ShoppingCartFrontend | null> {
  // Use mock data if enabled
  if (env.useMockData) {
    console.warn('🚧 Using mock basket data');
    return getMockBasket();
  }

  const username = AuthService.getCurrentUsername();
  const url = API_CONFIG.BASKET.GET_BASKET(username);

  try {
    const response = await httpClient.get<ShoppingCartResponse>(url);

    // Validate response with Zod schema
    const validatedData = ShoppingCartResponseSchema.parse(response.data);

    // Map to frontend camelCase format
    return mapShoppingCartToFrontend(validatedData);
  } catch (error) {
    // Return null if basket doesn't exist (404)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create or update basket for current user
 */
export async function createBasket(
  items: ShoppingCartItem[]
): Promise<ShoppingCartFrontend> {
  // Use mock data if enabled
  if (env.useMockData) {
    console.warn('🚧 Using mock basket creation');
    return getMockBasket();
  }

  const username = AuthService.getCurrentUsername();
  const url = API_CONFIG.BASKET.CREATE_BASKET;

  // Validate request with Zod schema
  const command = CreateShoppingCartCommandSchema.parse({
    UserName: username,
    Items: items,
  });

  const response = await httpClient.post<ShoppingCartResponse>(url, command);

  // Validate response
  const validatedData = ShoppingCartResponseSchema.parse(response.data);

  // Map to frontend format
  return mapShoppingCartToFrontend(validatedData);
}

/**
 * Delete basket for current user
 */
export async function deleteBasket(): Promise<void> {
  // Use mock data if enabled
  if (env.useMockData) {
    console.warn('🚧 Mock basket delete (no-op)');
    return;
  }

  const username = AuthService.getCurrentUsername();
  const url = API_CONFIG.BASKET.DELETE_BASKET(username);

  await httpClient.delete(url);
}

/**
 * Checkout basket (creates order from basket)
 */
export interface CheckoutRequest {
  totalPrice: number;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  addressLine?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  cardName?: string;
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  paymentMethod?: number;
}

export async function checkoutBasket(
  request: CheckoutRequest
): Promise<{ success: boolean; orderId?: number }> {
  // Use mock data if enabled
  if (env.useMockData) {
    console.warn('🚧 Using mock checkout');
    return getMockCheckoutResponse();
  }

  const username = AuthService.getCurrentUsername();
  const url = API_CONFIG.BASKET.CHECKOUT;

  // Validate request with Zod schema
  const command = CheckoutBasketCommandSchema.parse({
    UserName: username,
    TotalPrice: request.totalPrice,
    FirstName: request.firstName,
    LastName: request.lastName,
    EmailAddress: request.emailAddress,
    AddressLine: request.addressLine,
    Country: request.country,
    State: request.state,
    ZipCode: request.zipCode,
    CardName: request.cardName,
    CardNumber: request.cardNumber,
    Expiration: request.expiration,
    CVV: request.cvv,
    PaymentMethod: request.paymentMethod,
  });

  const response = await httpClient.post(url, command);

  return {
    success: true,
    orderId: response.data?.orderId,
  };
}
