// Legacy mock auth (kept for backward compatibility)
export { AuthService } from './auth.service';
export { AuthStorage } from './auth.storage';
export type { User, AuthState as LegacyAuthState, LoginRequest, LoginResponse } from './auth.types';

// B2C Configuration (from local config)
export {
  B2C_CONFIG,
  buildB2CAuthority,
  buildApiScope,
  defaultScopes,
  createMsalConfig,
  msalConfig,
  loginRequest,
  tokenRequest,
  scopes,
  getMsalInstance,
  initializeMsal,
  hostMsalConfig,
} from './msal';

// Re-export auth components and hooks from the shared package
export {
  // Provider
  EcommerceAuthProvider,
  AuthConsumerProvider,
  MsalAuthProvider,
  InternalAuthProvider,
  AuthErrorBoundary,
  // Main hook
  useAuth,
  // Additional hooks
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
  // Utilities
  isExpiryTimestampExpired,
  getTokenExpiry,
  isTokenExpired,
  // Constants
  TOKEN_BROADCAST_EVENT,
  AUTH_STATE_BROADCAST_EVENT,
} from '@ecommerce-platform/auth-provider';

export type {
  AuthUser,
  AuthState,
  AuthContextType,
  DebugOptions,
  MsalConfigOptions,
  TokenBroadcastEventDetail,
  TokenBroadcastState,
  HostAuthContext,
  AuthConsumerProviderProps,
  EcommerceAuthProviderProps,
} from '@ecommerce-platform/auth-provider';
