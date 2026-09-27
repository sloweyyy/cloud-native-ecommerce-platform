import { useQuery } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import { activitiesKeys } from './keys';
import { env } from '../../config';
import * as activitiesApi from './apis';
import type { Activity } from './types';

/**
 * Hook to fetch recent activities
 *
 * @param options - Query options
 * @param options.pageSize - Number of activities to fetch (default: 10)
 * @param options.pageIndex - Page index (0-based, default: 0)
 * @param options.activityType - Filter by activity type
 * @param options.entityType - Filter by entity type
 * @param options.from - Filter from date
 * @param options.to - Filter to date
 * @param options.actor - Filter by actor
 * @param options.enabled - Enable/disable query
 * @param options.staleTime - Stale time in ms (default: 10000 = 10 seconds)
 * @returns Query result with activities, loading state, and error
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetRecentActivities({
 *   pageSize: 10,
 *   entityType: 'Product'
 * });
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <ActivityList activities={data?.items || []} />;
 * ```
 */
export const useGetRecentActivities = (
  options?: ReactQueryOptions<{ items: Activity[]; totalCount: number; pageIndex: number; pageSize: number; totalPages: number }> & {
    pageSize?: number;
    pageIndex?: number;
    activityType?: string;
    entityType?: string;
    from?: string;
    to?: string;
    actor?: string;
    useMock?: boolean;
    staleTime?: number;
  }
) => {
  const {
    enabled = true,
    initialData,
    useMock,
    pageSize = 10,
    pageIndex = 0,
    activityType,
    entityType,
    from,
    to,
    actor,
    staleTime = 10000, // 10 seconds
    ...rest
  } = options || {};

  const shouldUseMock = useMock ?? env.useMockData;

  return useQuery<{ items: Activity[]; totalCount: number; pageIndex: number; pageSize: number; totalPages: number }>({
    ...rest,
    enabled,
    queryKey: activitiesKeys.recent.create({
      pageSize,
      pageIndex,
      activityType,
      entityType,
      from,
      to,
      actor,
    }),
    queryFn: async () => {
      const result = await activitiesApi.getRecentActivities({
        params: {
          pageIndex,
          pageSize,
          activityType,
          entityType,
          from,
          to,
          actor,
          useMock: shouldUseMock,
        },
      });
      return result?.data ?? {
        items: [],
        totalCount: 0,
        pageIndex: 0,
        pageSize: 10,
        totalPages: 0,
      };
    },
    initialData: initialData,
    staleTime,
  });
};

