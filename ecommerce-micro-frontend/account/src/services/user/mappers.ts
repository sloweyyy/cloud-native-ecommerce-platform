import type { UserResponse, User } from './types';
import { userResponseSchema } from './schemas';

/**
 * Map backend UserResponse to frontend User
 * Note: Backend returns camelCase
 */
export function mapUser(response: UserResponse): User | null {
  // Validate with Zod schema
  const parseResult = userResponseSchema.safeParse(response);
  if (!parseResult.success) {
    console.warn('[User Mapper] Invalid user response:', parseResult.error);
    return null;
  }

  const data = parseResult.data;

  return {
    id: data.id,
    userName: data.userName,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    role: data.role,
    avatar: data.avatar,
  };
}

// ====================================
// Mapper object for compatibility with createMapper pattern
// ====================================

export const userMapper = {
  toDto: mapUser,
  toListDto: (users: UserResponse[] | null | undefined) => {
    if (!users || users.length === 0) {
      return [];
    }
    return users.map(mapUser).filter((user): user is User => user !== null);
  },
};

