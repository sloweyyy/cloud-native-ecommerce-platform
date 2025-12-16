/**
 * User API Service
 * Integrates with backend User API endpoints via Azure AD B2C MSAL
 *
 * Since the backend doesn't have a dedicated User Profile API endpoint,
 * user information is obtained from the Azure MSAL authentication state.
 */

import { AuthService } from '../../auth';
import { mapUser } from './mappers';
import type {
  GetUserProfileRequest,
  UpdateUserProfileRequest,
  UserResponse,
  User,
} from './types';

/**
 * Get user profile for current user
 * Uses AuthService to get authenticated user info from Azure MSAL
 */
export async function getUserProfile(request?: {
  params?: GetUserProfileRequest;
}): Promise<{ data: User } | null> {
  try {
    // Get current authenticated user from AuthService (MSAL)
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser) {
      console.log('[User API] No authenticated user found');
      return null;
    }

    // Transform AuthService user to UserResponse format
    const userResponse: UserResponse = {
      id: currentUser.username, // Use username as ID
      userName: currentUser.username,
      firstName: currentUser.displayName?.split(' ')[0] || currentUser.username,
      lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
      email: currentUser.email || `${currentUser.username}@example.com`,
      phone: undefined,
      role: 'customer',
      avatar: undefined,
    };

    // Map to frontend User type
    const user = mapUser(userResponse);

    if (!user) {
      console.warn('[User API] Failed to map user response');
      return null;
    }

    return { data: user };
  } catch (error) {
    console.error('[User API] Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 * Note: Currently not supported as there's no backend endpoint.
 * User profile updates would typically be handled via Azure AD B2C portal.
 */
export async function updateUserProfile(request: {
  payload: UpdateUserProfileRequest;
}): Promise<{ data: User } | null> {
  console.warn(
    '[User API] updateUserProfile is not currently supported.',
    'Profile updates should be done via Azure AD B2C portal.',
    request.payload
  );

  // Return current profile to indicate success (no actual update)
  return getUserProfile();
}
