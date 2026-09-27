import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

export const activitiesParamsInput = createApiInputFactory(
  z.object({
    pageIndex: z.number().int().min(0).default(0).optional(),
    pageSize: z.number().int().min(1).max(100).default(10).optional(),
    activityType: z.string().optional(),
    entityType: z.string().optional(),
    from: z.string().optional(), // ISO 8601 datetime string
    to: z.string().optional(), // ISO 8601 datetime string
    actor: z.string().optional(),
    useMock: z.boolean().optional(),
  })
);

export type ActivitiesParamsInput = z.infer<typeof activitiesParamsInput>;

