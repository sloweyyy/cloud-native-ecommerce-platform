import { z } from 'zod';
import { createApiInputFactory } from '../factory/createApiInputFactory';

// Input for get user profile
export const getUserProfileInput = createApiInputFactory(
  z.object({
    userName: z.string().optional(),
  })
);

// Input for update user profile operation
export const updateUserProfileInput = createApiInputFactory(
  z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })
);

// Export inferred types
export type GetUserProfileInput = z.infer<typeof getUserProfileInput>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInput>;

