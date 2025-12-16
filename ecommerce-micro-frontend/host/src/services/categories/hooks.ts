import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from './api';
import { Categories, Category } from './types';
import { createCacheKeyWithScope, CACHE_KEY_PREFIX } from '../factory/createCacheKeyFactory';

const createCacheKey = createCacheKeyWithScope('categories');

const CACHE_KEYS = {
  all: createCacheKey(['all']),
} as const;

/**
 * Default fallback category when API fails
 */
const DEFAULT_CATEGORIES: Categories = [
  {
    id: 'laptops',
    name: 'Laptops',
    nameVi: 'Laptop',
    icon: '💻',
    path: '/store?cat=laptops',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];

/**
 * Hook to fetch all categories
 * - Uses React Query for automatic caching and deduplication
 * - Returns fallback data on error
 */
export function useCategories() {
  const query = useQuery({
    queryKey: CACHE_KEYS.all,
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    categories: query.data ?? DEFAULT_CATEGORIES,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export type { Category, Categories };

