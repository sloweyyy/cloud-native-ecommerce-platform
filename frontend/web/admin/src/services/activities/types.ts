import { z } from 'zod';
import {
  activityResponseSchema,
  pagedResultSchema,
  activitySchema,
} from './schemas';

// Response types (from API)
export type ActivityResponse = z.infer<typeof activityResponseSchema>;
export type PagedResultResponse = z.infer<typeof pagedResultSchema>;

// DTO types (for application use)
export type Activity = z.infer<typeof activitySchema>;
export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
};

// Re-export input types from input.ts
export type {
  ActivitiesParamsInput,
} from './input';

