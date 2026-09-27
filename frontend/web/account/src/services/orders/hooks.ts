import { useQuery } from '@tanstack/react-query';
import type { AuthUser } from '@ecommerce-platform/auth-provider';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { orderKeys } from './keys';
import type { GetOrdersInput } from './input';

function getUserName(user: AuthUser | null | undefined): string {
  return (
    user?.email || user?.username || user?.displayName || user?.id || 'guest'
  );
}

export function useGetOrders(
  input?: GetOrdersInput,
  options?: Omit<ReactQueryOptions, 'initialData'> & { user?: AuthUser | null }
) {
  const { enabled = true, user: inputUser, ...queryOptions } = options || {};
  const userName = input?.userName || getUserName(inputUser);

  return useQuery({
    ...queryOptions,
    queryKey: orderKeys.get.create({ ...input, userName }),
    queryFn: async () => {
      const result = await apis.getOrders({
        params: { ...input, userName },
      });
      return result ?? null;
    },
    enabled: Boolean(enabled && inputUser),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}
