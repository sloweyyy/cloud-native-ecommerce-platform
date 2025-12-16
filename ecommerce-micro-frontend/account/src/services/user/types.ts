import { z } from 'zod';
import {
  getUserProfileRequestSchema,
  updateUserProfileRequestSchema,
  userResponseSchema,
  userSchema,
} from './schemas';

// ====================================
// REQUEST TYPES
// ====================================

export type GetUserProfileRequest = z.infer<
  typeof getUserProfileRequestSchema
>;
export type UpdateUserProfileRequest = z.infer<
  typeof updateUserProfileRequestSchema
>;

// ====================================
// BACKEND RESPONSE TYPES
// ====================================

export type UserResponse = z.infer<typeof userResponseSchema>;

// ====================================
// FRONTEND DTO TYPES (camelCase)
// ====================================

export type User = z.infer<typeof userSchema>;

