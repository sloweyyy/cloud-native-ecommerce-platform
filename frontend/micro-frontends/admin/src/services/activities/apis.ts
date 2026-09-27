import { createApiFactory } from '../factory/createApiFactory';
import { Request } from '../types';
import {
  activitiesParamsInput,
  ActivitiesParamsInput,
} from './input';
import {
  activityMapper,
} from './mappers';
import {
  Activity,
  PagedResultResponse,
} from './types';
import {
  pagedResultSchema,
} from './schemas';

export const apiFactory = createApiFactory('/Activity', { version: 'v1' });

/**
 * Get recent activities with pagination and filters
 *
 * @param request - Request parameters
 * @param request.params.pageIndex - Page index (0-based, default: 0)
 * @param request.params.pageSize - Page size (default: 10)
 * @param request.params.activityType - Filter by activity type (e.g., "Product.Created")
 * @param request.params.entityType - Filter by entity type (e.g., "Product", "Order")
 * @param request.params.from - Filter from date (ISO 8601)
 * @param request.params.to - Filter to date (ISO 8601)
 * @param request.params.actor - Filter by actor/user
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Paginated list of activities
 *
 * @example
 * ```typescript
 * const result = await getRecentActivities({
 *   params: {
 *     pageIndex: 0,
 *     pageSize: 10,
 *     entityType: 'Product'
 *   }
 * });
 * ```
 */
export async function getRecentActivities(
  request?: Request<ActivitiesParamsInput>
) {
  return apiFactory<PagedResultResponse, { items: Activity[]; totalCount: number; pageIndex: number; pageSize: number; totalPages: number }>(
    'GET',
    '/',
    request || {},
    {
      transformer: (response: PagedResultResponse | { data: PagedResultResponse }) => {
        // Handle both direct response and wrapped response
        const pagedResult = 'data' in response ? response.data : response;
        
        if (!pagedResult || !pagedResult.items) {
          return {
            items: [],
            totalCount: 0,
            pageIndex: 0,
            pageSize: 10,
            totalPages: 0,
          };
        }
        return {
          items: activityMapper.toListDto(pagedResult.items),
          totalCount: pagedResult.totalCount,
          pageIndex: pagedResult.pageIndex,
          pageSize: pagedResult.pageSize,
          totalPages: pagedResult.totalPages,
        };
      },
      paramsSchema: activitiesParamsInput,
      responseSchema: pagedResultSchema,
      useMock: request?.params?.useMock ?? false,
    }
  );
}

