import { createApiFactory } from '../factory/createApiFactory';
import { Request, RequestPayloadRequired } from '../types';
import {
  GetUserProfileInput,
  UpdateUserProfileInput,
} from './input';
import {
  userMapper,
} from './mappers';
import {
  UserResponse,
} from './types';
import { getStoredUser } from '@ecommerce-platform/auth-provider';

export const apiFactory = createApiFactory('/user', { version: 'v1' });

/**
 * Get user profile for current user
 * Uses auth-provider to get authenticated user info from Azure MSAL
 *
 * @param request - Optional request parameters
 * @param request.params.userName - Optional user name (defaults to current user)
 * @param request.params.user - Optional user object from auth-provider
 * @param request.params.useMock - Use mock data for development/testing
 * @returns User profile data
 *
 * @example
 * ```typescript
 * const result = await getUserProfile({
 *   params: { useMock: true }
 * });
 * ```
 */
export async function getUserProfile(request?: Request<GetUserProfileInput & { user?: ReturnType<typeof getStoredUser> }>) {
  // Get current authenticated user from auth-provider (MSAL)
  const currentUser = request?.params?.user || getStoredUser();

  if (!currentUser) {
    console.log('[User API] No authenticated user found');
    return null;
  }

  // Transform auth-provider user to UserResponse format
  const userResponse: UserResponse = {
    id: currentUser.id || currentUser.username || currentUser.email || '',
    userName: currentUser.username || currentUser.email || currentUser.id || '',
    firstName: currentUser.displayName?.split(' ')[0] || currentUser.username || currentUser.email || '',
    lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
    email: currentUser.email || `${currentUser.username || currentUser.id}@example.com`,
    phone: undefined,
    role: 'customer',
    avatar: undefined,
  };

  // Map to frontend User type
  const user = userMapper.toDto(userResponse);

  if (!user) {
    console.warn('[User API] Failed to map user response');
    return null;
  }

  return { data: user };
}

/**
 * Update user profile
 * Note: Currently not supported as there's no backend endpoint.
 * User profile updates would typically be handled via Azure AD B2C portal.
 *
 * @param request - Request with user profile data
 * @param request.payload - User profile update data
 * @param request.params.useMock - Use mock data for development/testing
 * @returns Updated user profile
 *
 * @example
 * ```typescript
 * const result = await updateUserProfile({
 *   payload: {
 *     firstName: 'John',
 *     lastName: 'Doe'
 *   }
 * });
 * ```
 */
export async function updateUserProfile(
  request: RequestPayloadRequired<UpdateUserProfileInput>
) {
  console.warn(
    '[User API] updateUserProfile is not currently supported.',
    'Profile updates should be done via Azure AD B2C portal.',
    request.payload
  );

  // Return current profile to indicate success (no actual update)
  return getUserProfile();
}
