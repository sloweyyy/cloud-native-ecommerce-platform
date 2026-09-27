import { User } from '@ecommerce-platform/app-injector';

/**
 * Get display name for user
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.email) {
    return user.email;
  }
  return 'Guest';
}

