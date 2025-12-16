import type { AccountInfo } from '@azure/msal-browser';
import type { AuthUser, AuthState, DebugOptions } from '../types';

/**
 * Convert MSAL AccountInfo to AuthUser
 */
export function accountInfoToAuthUser(account: AccountInfo): AuthUser {
  const claims = account.idTokenClaims as Record<string, unknown> | undefined;

  return {
    id: account.localAccountId || account.homeAccountId,
    username: account.username,
    displayName: account.name || account.username,
    email: account.username,
    firstName: claims?.given_name as string | undefined,
    lastName: claims?.family_name as string | undefined,
    accountInfo: account,
    claims,
  };
}

/**
 * Create AuthUser from debug options
 */
export function createDebugUser(presetUser?: Partial<AuthUser>): AuthUser {
  return {
    id: presetUser?.id || 'debug-user-id',
    username: presetUser?.username || presetUser?.email || 'debug@example.com',
    displayName: presetUser?.displayName || 'Debug User',
    email: presetUser?.email || 'debug@example.com',
    firstName: presetUser?.firstName || 'Debug',
    lastName: presetUser?.lastName || 'User',
    claims: presetUser?.claims,
  };
}

/**
 * Create initial auth state from debug options
 */
export function createDebugAuthState(debug: DebugOptions): AuthState {
  return {
    user: debug.presetUser ? createDebugUser(debug.presetUser) : createDebugUser(),
    isAuthenticated: true,
    isLoading: false,
    accessToken: debug.presetToken || 'debug-token',
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Create initial unauthenticated state
 */
export function createUnauthenticatedState(): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Create loading state
 */
export function createLoadingState(): AuthState {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    tokenExpiry: null,
    error: null,
  };
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get current origin for redirect URI
 */
export function getCurrentOrigin(): string {
  if (!isBrowser()) return 'http://localhost:4200';
  return window.location.origin;
}

/**
 * Log debug message if logging is enabled
 */
export function debugLog(
  debug: DebugOptions | undefined,
  message: string,
  ...args: unknown[]
): void {
  if (debug?.logging) {
    console.log(`[AuthProvider] ${message}`, ...args);
  }
}

