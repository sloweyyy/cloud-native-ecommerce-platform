/**
 * Basket API Service for Host Module
 * Only read operations for Navbar display
 */

import { axiosClient } from '../httpClient';
import { API_CONFIG } from '../../config';
import { AuthService } from '../../auth';
import { mapBasket } from './mappers';
import { shoppingCartResponseSchema } from './schemas';
import type { ShoppingCartResponse, Basket } from './types';

/**
 * Create an empty basket for a user
 */
function createEmptyBasket(userName: string): Basket {
  return {
    userName,
    items: [],
    totalPrice: 0,
    itemCount: 0,
    isEmpty: true,
  };
}

/**
 * Get basket for current user
 */
export async function getBasket(userName?: string): Promise<Basket | null> {
  // Ensure user is never undefined - fallback to 'guest'
  const user = userName || AuthService.getCurrentUsername() || 'guest';
  const url = API_CONFIG.BASKET.GET_BASKET(user);

  console.log('[Basket API] getBasket - user:', user);

  try {
    const response = await axiosClient.get<ShoppingCartResponse>(url);

    // Handle 204 No Content - basket doesn't exist yet
    if (response.status === 204) {
      console.log('[Basket API] No basket exists yet (204), returning empty basket');
      return createEmptyBasket(user);
    }

    // Handle empty or null responses (backend may return "" or null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = response.data as any;
    if (!data || data === '' || typeof data === 'string') {
      console.log('[Basket API] Empty response, returning empty basket');
      return createEmptyBasket(user);
    }

    // Validate response with Zod schema
    const parseResult = shoppingCartResponseSchema.safeParse(response.data);

    if (!parseResult.success) {
      console.warn('[Basket API] Invalid response format:', parseResult.error);
      return createEmptyBasket(user);
    }

    // Transform to frontend Basket format
    const basket = mapBasket(parseResult.data);
    return basket ?? createEmptyBasket(user);
  } catch (error) {
    // Return empty basket if basket doesn't exist (404) or any other error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (error as any)?.response?.status;

    if (status === 404 || status === 204) {
      console.log(`[Basket API] Basket not found (${status}), returning empty basket`);
      return createEmptyBasket(user);
    }

    // Log other errors but don't crash the app - return empty basket
    console.error('[Basket API] Error fetching basket:', error);
    return createEmptyBasket(user);
  }
}
