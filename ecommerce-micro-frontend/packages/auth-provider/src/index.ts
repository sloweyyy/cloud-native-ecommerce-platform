/**
 * @ecommerce-platform/auth-provider
 *
 * Reusable React authentication provider for ecommerce micro-frontend applications.
 * Provides MSAL integration, token management, and auth context.
 *
 * @packageDocumentation
 */

// Main provider exports
export { EcommerceAuthProvider } from './EcommerceAuthProvider';
export { AuthConsumerProvider } from './AuthConsumerProvider';

// Internal components (for apps with existing MSAL/QueryClient setup)
export {
  InternalAuthProvider,
  MsalAuthProvider,
  AuthErrorBoundary,
} from './components';

// Main hook
export { useAuth } from './useAuth';

// Auth context
export { AuthContext } from './AuthContext';

// Additional hooks
export {
  useLogin,
  useLogout,
  useAccessToken,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useUserDisplayName,
  useUserEmail,
  useMsalAuth,
  useTokenBroadcastSubscription,
  broadcastToken,
} from './hooks';

// Utility exports
export {
  // Auth utilities
  accountInfoToAuthUser,
  createDebugUser,
  createDebugAuthState,
  createUnauthenticatedState,
  createLoadingState,
  isBrowser,
  getCurrentOrigin,
  debugLog,
  // Token utilities
  getTokenExpiry,
  isTokenExpired,
  isExpiryTimestampExpired,
  // Storage utilities
  safeStorage,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredTokenExpiry,
  setStoredTokenExpiry,
  removeStoredTokenExpiry,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthStorage,
} from './utils';

// Constants
export {
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_EXPIRY_KEY,
  AUTH_USER_KEY,
  TOKEN_BROADCAST_EVENT,
  AUTH_STATE_BROADCAST_EVENT,
  TOKEN_EXPIRY_BUFFER_SECONDS,
  DEFAULT_SCOPES,
} from './constants';

// Type exports
export type {
  AuthUser,
  DebugOptions,
  MsalConfigOptions,
  AuthState,
  AuthContextType,
  EcommerceAuthProviderProps,
  InternalAuthProviderProps,
  TokenBroadcastEventDetail,
  TokenBroadcastState,
  HostUser,
  HostAuthContext,
  AuthConsumerProviderProps,
} from './types';
