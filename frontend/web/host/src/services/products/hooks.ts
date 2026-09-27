import { useQuery } from '@tanstack/react-query';
import { getProducts } from './api';
import { Product, ProductsParams } from './types';
import { createCacheKeyWithScope } from '../factory/createCacheKeyFactory';

const createCacheKey = createCacheKeyWithScope('products');

const CACHE_KEYS = {
  all: (params?: ProductsParams) => createCacheKey(['all', params]),
} as const;

const DEFAULT_PRODUCTS: Product[] = [];

export function useProducts(params?: ProductsParams) {
  const query = useQuery({
    queryKey: CACHE_KEYS.all(params),
    queryFn: () => getProducts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    products: query.data ?? DEFAULT_PRODUCTS,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export type { Product, ProductsParams };

