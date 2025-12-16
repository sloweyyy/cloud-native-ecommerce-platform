import { z } from 'zod';

// ====================================
// REQUEST SCHEMAS
// ====================================

export const getUserProfileRequestSchema = z.object({
  userName: z.string().optional(),
  useMock: z.boolean().optional(),
});

export const updateUserProfileRequestSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  useMock: z.boolean().optional(),
});

// ====================================
// BACKEND RESPONSE SCHEMAS (camelCase - actual API response)
// ====================================

/**
 * Backend User response schema
 * Matches actual API response
 */
export const userResponseSchema = z.object({
  id: z.string().optional(),
  userName: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

// ====================================
// FRONTEND DTO SCHEMAS (camelCase for React)
// ====================================

/**
 * Frontend User DTO schema
 */
export const userSchema = z.object({
  id: z.string().optional(),
  userName: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

