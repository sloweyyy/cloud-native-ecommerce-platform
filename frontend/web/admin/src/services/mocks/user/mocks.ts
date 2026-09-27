import type { UserResponse } from '../../user/types';

/**
 * Mock user profile data
 */
export const mockUserResponse: UserResponse = {
  id: 'user-123',
  userName: 'testuser',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  role: 'customer',
  avatar: null,
};

