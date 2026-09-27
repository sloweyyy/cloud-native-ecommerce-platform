import { z } from 'zod';

export const activityResponseSchema = z.object({
  id: z.number(),
  activityType: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  actor: z.string().optional().nullable(),
  sourceService: z.string(),
  occurredAt: z.string(), // ISO 8601 datetime string
  createdDate: z.string().optional().nullable(), // ISO 8601 datetime string
});

export const pagedResultSchema = z.object({
  items: z.array(activityResponseSchema),
  totalCount: z.number(),
  pageIndex: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const activitySchema = z.object({
  id: z.number(),
  activityType: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  actor: z.string().optional().nullable(),
  sourceService: z.string(),
  occurredAt: z.string(),
  createdDate: z.string().optional().nullable(),
  timeAgo: z.string().optional(), // Calculated on frontend
});

