import { QueryClient } from '@tanstack/react-query';

export const activitiesKeys = {
  all: {
    create: (params?: { pageIndex?: number; pageSize?: number; filters?: string }) => 
      ['activities', 'list', params] as const,
    invalidateQueries: (queryClient: QueryClient) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  },
  recent: {
    create: (params?: {
      pageSize?: number;
      pageIndex?: number;
      activityType?: string;
      entityType?: string;
      from?: string;
      to?: string;
      actor?: string;
    }) => 
      ['activities', 'recent', params] as const,
  },
} as const;

