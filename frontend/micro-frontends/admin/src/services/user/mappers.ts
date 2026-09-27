import { createMapper } from '../factory/createMapper';
import {
  User,
  UserResponse,
} from './types';
import {
  userResponseSchema,
} from './schemas';

// Mapper for single user
export const userMapper = createMapper<UserResponse, User>(
  (response) => {
    return {
      id: response.id,
      userName: response.userName,
      firstName: response.firstName ?? undefined,
      lastName: response.lastName ?? undefined,
      email: response.email ?? undefined,
      phone: response.phone ?? undefined,
      role: response.role ?? undefined,
      avatar: response.avatar ?? undefined,
    };
  },
  userResponseSchema
);
