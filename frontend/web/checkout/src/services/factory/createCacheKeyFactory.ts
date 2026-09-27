import { QueryClient, QueryKey } from '@tanstack/react-query';

export const CACHE_KEY_PREFIX = 'ecommerce-cache';

interface CacheSection<T extends unknown[]> {
  create: (...args: T) => QueryKey;
  invalidateQueries: (queryClient: QueryClient, ...createArgs: T) => void;
}

function createCacheKey(input: QueryKey): QueryKey {
  const newKey = [...input];
  if (newKey[0] === CACHE_KEY_PREFIX) {
    return newKey;
  }
  return [CACHE_KEY_PREFIX, ...newKey];
}

export function createCacheKeyWithScope(
  scope: string,
): (input: QueryKey) => QueryKey {
  return (input: QueryKey) => {
    const newKey = [...input];
    if (newKey[0] === CACHE_KEY_PREFIX && newKey[1] === scope) {
      return createCacheKey(newKey);
    }
    return createCacheKey([scope, ...newKey]);
  };
}

export function createCacheSection<T extends unknown[]>(
  createKeyFn: (...args: T) => QueryKey,
): CacheSection<T> {
  return {
    create: createKeyFn,
    invalidateQueries(queryClient: QueryClient, ...createArgs: T) {
      const cacheKey = this.create(...createArgs);
      queryClient.invalidateQueries({ queryKey: cacheKey, exact: false });
    },
  };
}

