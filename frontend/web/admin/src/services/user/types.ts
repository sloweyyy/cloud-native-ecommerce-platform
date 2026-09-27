import { z } from 'zod';
import {
  userResponseSchema,
  userSchema,
} from './schemas';

// Response types (from API)
export type UserResponse = z.infer<typeof userResponseSchema>;

// DTO types (for application use)
export type User = z.infer<typeof userSchema>;

// Re-export input types from input.ts
export type {
  GetUserProfileInput,
  UpdateUserProfileInput,
} from './input';

