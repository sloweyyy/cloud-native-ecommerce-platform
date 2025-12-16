import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { AuthContext } from '../AuthContext';
import type {
  InternalAuthProviderProps,
  AuthContextType,
  AuthState,
} from '../types';
import {
  accountInfoToAuthUser,
  createDebugAuthState,
  createLoadingState,
  createUnauthenticatedState,
  debugLog,
} from '../utils/auth';
import { getTokenExpiry, isExpiryTimestampExpired } from '../utils/token';
import {
  useTokenBroadcastSubscription,
  broadcastToken,
} from '../hooks/useTokenBroadcast';
import { DEFAULT_SCOPES } from '../constants';

/**
 * InternalAuthProvider
 *
 * Internal provider that manages auth state and provides context.
 * Use this when you already have MsalProvider and QueryClientProvider.
 */
export const InternalAuthProvider: React.FC<InternalAuthProviderProps> = ({
  children,
  debug = {},
}) => {
  const isDebugMode = Boolean(debug.presetToken);

  // MSAL hooks (only used when not in debug mode)
  const { instance, accounts, inProgress } = useMsal();
  const isMsalAuthenticated = useIsAuthenticated();
  const account = useAccount(accounts[0] || null);

  // Initialize state
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (isDebugMode) {
      debugLog(debug, 'Initializing in debug mode with preset token');
      return createDebugAuthState(debug);
    }
    return createLoadingState();
  });

  // Subscribe to token broadcasts (for remote modules)
  const broadcastState = useTokenBroadcastSubscription(!isDebugMode);

  // Sync state when MSAL state changes
  useEffect(() => {
    if (isDebugMode) return;

    if (inProgress !== InteractionStatus.None) {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (isMsalAuthenticated && account) {
      const user = accountInfoToAuthUser(account);
      debugLog(debug, 'User authenticated via MSAL', user.displayName);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: null,
        tokenExpiry: null,
        error: null,
      });
    } else {
      debugLog(debug, 'User not authenticated');
      setAuthState(createUnauthenticatedState());
    }
  }, [isDebugMode, isMsalAuthenticated, account, inProgress, debug]);

  // Sync state when broadcast token changes
  useEffect(() => {
    if (isDebugMode) return;
    if (!broadcastState.token || broadcastState.lastUpdated === 0) return;

    debugLog(debug, 'Received token broadcast', {
      hasToken: !!broadcastState.token,
      timestamp: new Date(broadcastState.lastUpdated).toISOString(),
    });

    setAuthState((prev) => ({
      ...prev,
      accessToken: broadcastState.token,
      tokenExpiry: broadcastState.tokenExpiry,
    }));
  }, [isDebugMode, broadcastState, debug]);

  // Login handler
  const login = useCallback(async (): Promise<void> => {
    if (isDebugMode) {
      debugLog(debug, 'Login called in debug mode - no action taken');
      return;
    }

    try {
      debugLog(debug, 'Initiating login redirect');
      await instance.loginRedirect({
        scopes: DEFAULT_SCOPES,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      debugLog(debug, 'Login error:', err.message);
      setAuthState((prev) => ({ ...prev, error: err }));
    }
  }, [isDebugMode, instance, debug]);

  // Logout handler
  const logout = useCallback(async (): Promise<void> => {
    if (isDebugMode) {
      debugLog(debug, 'Logout in debug mode - clearing state');
      setAuthState(createUnauthenticatedState());
      return;
    }

    try {
      debugLog(debug, 'Initiating logout redirect');
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      debugLog(debug, 'Logout error:', err.message);
      setAuthState((prev) => ({ ...prev, error: err }));
    }
  }, [isDebugMode, instance, debug]);

  // Get access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (isDebugMode) {
      return debug.presetToken || null;
    }

    // Return cached token if valid
    if (
      authState.accessToken &&
      !isExpiryTimestampExpired(authState.tokenExpiry)
    ) {
      return authState.accessToken;
    }

    if (!account) {
      debugLog(debug, 'No account available for token acquisition');
      return null;
    }

    try {
      debugLog(debug, 'Acquiring token silently');
      const response = await instance.acquireTokenSilent({
        scopes: DEFAULT_SCOPES,
        account,
      });

      const token = response.accessToken;
      const tokenExpiry = getTokenExpiry(token);

      setAuthState((prev) => ({
        ...prev,
        accessToken: token,
        tokenExpiry,
      }));

      // Broadcast token to other micro-frontends
      broadcastToken(token, tokenExpiry);

      debugLog(debug, 'Token acquired successfully');
      return token;
    } catch (error) {
      debugLog(debug, 'Silent token acquisition failed, trying redirect');
      try {
        await instance.acquireTokenRedirect({
          scopes: DEFAULT_SCOPES,
          account,
        });
        return null;
      } catch (redirectError) {
        const err =
          redirectError instanceof Error
            ? redirectError
            : new Error(String(redirectError));
        debugLog(debug, 'Token acquisition failed:', err.message);
        setAuthState((prev) => ({ ...prev, error: err }));
        return null;
      }
    }
  }, [
    isDebugMode,
    debug,
    authState.accessToken,
    authState.tokenExpiry,
    account,
    instance,
  ]);

  // Check if token is expired
  const isTokenExpired = useCallback((): boolean => {
    if (isDebugMode) return false;
    return isExpiryTimestampExpired(authState.tokenExpiry);
  }, [isDebugMode, authState.tokenExpiry]);

  // Context value
  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...authState,
      login,
      logout,
      getAccessToken,
      isTokenExpired,
      isDebugMode,
    }),
    [authState, login, logout, getAccessToken, isTokenExpired, isDebugMode]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
