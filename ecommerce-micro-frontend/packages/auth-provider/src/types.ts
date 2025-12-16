import type { AccountInfo } from '@azure/msal-browser';
import type { ReactNode } from 'react';

/**
 * User information from authentication
 */
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  accountInfo?: AccountInfo;
  claims?: Record<string, unknown>;
}

/**
 * Debug options for development mode
 */
export interface DebugOptions {
  /** Enable console logs for debugging */
  logging?: boolean;
  /** Preset token to use in development (bypasses MSAL) */
  presetToken?: string;
  /** Preset user info for development */
  presetUser?: Partial<AuthUser>;
  /** Environment override: development, staging, or production */
  env?: 'development' | 'staging' | 'production';
}

/**
 * MSAL configuration options
 */
export interface MsalConfigOptions {
  /** Azure AD B2C client ID */
  clientId: string;
  /** Azure AD B2C authority URL */
  authority: string;
  /** Known authorities for B2C */
  knownAuthorities?: string[];
  /** Redirect URI after login */
  redirectUri?: string;
  /** Post logout redirect URI */
  postLogoutRedirectUri?: string;
  /** Scopes for token requests */
  scopes?: string[];
}

/**
 * Internal auth state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  error: Error | null;
}

/**
 * Auth context value with all auth operations
 */
export interface AuthContextType extends AuthState {
  /** Initiate login flow */
  login: () => Promise<void>;
  /** Initiate logout flow */
  logout: () => Promise<void>;
  /** Get access token (refreshes if needed) */
  getAccessToken: () => Promise<string | null>;
  /** Check if token is expired */
  isTokenExpired: () => boolean;
  /** Whether running in debug mode */
  isDebugMode: boolean;
}

/**
 * Props for EcommerceAuthProvider (main entry)
 */
export interface EcommerceAuthProviderProps {
  children: ReactNode;
  /** MSAL configuration */
  msalConfig: MsalConfigOptions;
  /** Debug options for development */
  debug?: DebugOptions;
}

/**
 * Props for InternalAuthProvider (without MSAL/QueryClient wrappers)
 */
export interface InternalAuthProviderProps {
  children: ReactNode;
  /** Debug options for development */
  debug?: DebugOptions;
}

/**
 * Token broadcast event detail
 */
export interface TokenBroadcastEventDetail {
  token: string | null;
  tokenExpiry: number | null;
  timestamp: number;
}

/**
 * Token broadcast state
 */
export interface TokenBroadcastState {
  token: string | null;
  tokenExpiry: number | null;
  lastUpdated: number;
}

/**
 * Host user information passed from host app via appContext
 */
export interface HostUser {
  id?: string;
  username?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

/**
 * Host auth context passed from host app via appContext.
 * Used by AuthConsumerProvider to receive auth state from the host application.
 */
export interface HostAuthContext {
  /** User information from host */
  user?: HostUser | null;
  /** Access token from host */
  token?: string | null;
  /** Token expiry timestamp (milliseconds) */
  tokenExpiry?: number | null;
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  /** Request token refresh from host */
  requestTokenRefresh?: () => Promise<string | null>;
  /** Logout handler from host */
  onLogout?: () => void | Promise<void>;
}

/**
 * Props for AuthConsumerProvider
 */
export interface AuthConsumerProviderProps {
  children: ReactNode;
  /** Host auth context from appContext */
  hostAuth?: HostAuthContext | null;
  /** Debug options for development */
  debug?: DebugOptions;
}

// Default context value
export const defaultAuthContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  tokenExpiry: null,
  error: null,
  isDebugMode: false,
  login: async () => {
    console.warn('[AuthProvider] login called before provider initialized');
  },
  logout: async () => {
    console.warn('[AuthProvider] logout called before provider initialized');
  },
  getAccessToken: async () => null,
  isTokenExpired: () => true,
};

