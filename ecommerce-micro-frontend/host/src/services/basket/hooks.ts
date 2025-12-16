import { useQuery } from '@tanstack/react-query';
import { getBasket } from './api';
import type { Basket } from './types';
import {
  createCacheKeyWithScope,
} from '../factory/createCacheKeyFactory';

const createCacheKey = createCacheKeyWithScope('basket');

const CACHE_KEYS = {
  all: createCacheKey(['all']),
} as const;

/**
 * Hook to fetch basket for current user
 * - Uses React Query for automatic caching and deduplication
 * - Returns null on error (non-blocking for Navbar)
 */
export function useBasket() {
  const query = useQuery<Basket | null>({
    queryKey: CACHE_KEYS.all,
    queryFn: () => getBasket(),
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry on failure for Navbar
    refetchOnWindowFocus: true,
  });

  return {
    basket: query.data ?? null,
    items: query.data?.items ?? [],
    itemCount: query.data?.itemCount ?? 0,
    totalPrice: query.data?.totalPrice ?? 0,
    isEmpty: query.data?.isEmpty ?? true,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Export cache keys for invalidation from other modules
 */
export const basketCacheKeys = CACHE_KEYS;
