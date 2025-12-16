import { useCallback } from 'react';
import { useAuth } from '../useAuth';

/**
 * Hook for login functionality
 */
export function useLogin() {
  const { login, isLoading, error } = useAuth();
  return { login, isLoading, error };
}

/**
 * Hook for logout functionality
 */
export function useLogout() {
  const { logout } = useAuth();
  return { logout };
}

/**
 * Hook to get access token
 */
export function useAccessToken() {
  const { getAccessToken, accessToken, isTokenExpired } = useAuth();

  const getToken = useCallback(async () => {
    if (accessToken && !isTokenExpired()) {
      return accessToken;
    }
    return getAccessToken();
  }, [accessToken, isTokenExpired, getAccessToken]);

  return { getToken, currentToken: accessToken };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to get auth loading state
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

/**
 * Hook to get user display name
 */
export function useUserDisplayName(): string {
  const { user } = useAuth();
  return user?.displayName || 'Guest';
}

/**
 * Hook to get user email
 */
export function useUserEmail(): string | undefined {
  const { user } = useAuth();
  return user?.email;
}

