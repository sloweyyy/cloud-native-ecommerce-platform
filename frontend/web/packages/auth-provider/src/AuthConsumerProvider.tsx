import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  AuthUser,
  AuthState,
  AuthContextType,
  DebugOptions,
  HostUser,
  HostAuthContext,
  AuthConsumerProviderProps,
} from './types';
import { AuthContext } from './AuthContext';
import {
  useTokenBroadcastSubscription,
  broadcastToken,
} from './hooks/useTokenBroadcast';
import {
  createDebugAuthState,
  createUnauthenticatedState,
  debugLog,
} from './utils/auth';
import { isExpiryTimestampExpired } from './utils/token';
import { TOKEN_EXPIRY_BUFFER_SECONDS } from './constants';

function convertToAuthUser(
  hostUser: HostUser | null | undefined
): AuthUser | null {
  if (!hostUser) return null;

  return {
    id: hostUser.id || hostUser.username || 'unknown',
    username: hostUser.username || hostUser.email || 'unknown',
    displayName:
      hostUser.displayName ||
      `${hostUser.firstName || ''} ${hostUser.lastName || ''}`.trim() ||
      hostUser.username ||
      'User',
    email: hostUser.email,
    firstName: hostUser.firstName,
    lastName: hostUser.lastName,
  };
}

function createInitialState(
  config?: HostAuthContext | null,
  debug?: DebugOptions
): AuthState {
  if (debug?.presetToken && debug?.presetUser) {
    return createDebugAuthState(debug);
  }

  if (config === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,
      tokenExpiry: null,
      error: null,
    };
  }

  if (config === null) {
    return createUnauthenticatedState();
  }

  return {
    user: convertToAuthUser(config.user),
    isAuthenticated:
      config.isAuthenticated ?? Boolean(config.token && config.user),
    isLoading: false,
    accessToken: config.token ?? null,
    tokenExpiry: config.tokenExpiry ?? null,
    error: null,
  };
}

export function AuthConsumerProvider(props: AuthConsumerProviderProps) {
  // 1. Props destructuring
  const { children, config, debug } = props;

  // 2. State hooks
  const [authState, setAuthState] = useState<AuthState>(() =>
    createInitialState(config, debug)
  );

  // 3. Ref hooks
  const debugRef = useRef<DebugOptions | undefined>(debug);
  debugRef.current = debug;

  const configRef = useRef<HostAuthContext | null | undefined>(config);
  const prevConfigValuesRef = useRef<string>('');
  const isFirstRenderRef = useRef<boolean>(true);

  // 4. Derived state
  const isDebugMode = Boolean(debug?.presetToken);
  const configUser = config?.user;
  const configToken = config?.token;
  const configIsAuthenticated = config?.isAuthenticated;

  // 5. Other hooks (custom hooks)
  const broadcastState = useTokenBroadcastSubscription(true);

  // 6. Effects
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const userId = configUser?.id || configUser?.username || '';
    const currentValues = `${userId}-${
      configToken ? 'has-token' : 'no-token'
    }-${configIsAuthenticated}`;

    const shouldUpdate =
      isFirstRenderRef.current || currentValues !== prevConfigValuesRef.current;

    if (shouldUpdate) {
      prevConfigValuesRef.current = currentValues;
      isFirstRenderRef.current = false;
      debugLog(debugRef.current, 'Config changed', { config });
      setAuthState(createInitialState(config, debugRef.current));
    }
  }, [
    configUser?.id,
    configUser?.username,
    configToken,
    configIsAuthenticated,
    config,
  ]);

  useEffect(() => {
    if (broadcastState.token && broadcastState.lastUpdated > 0) {
      debugLog(debugRef.current, 'Token broadcast received', {
        hasToken: !!broadcastState.token,
        expiry: broadcastState.tokenExpiry,
      });
      setAuthState((prev) => ({
        ...prev,
        accessToken: broadcastState.token,
        tokenExpiry: broadcastState.tokenExpiry,
      }));
    }
  }, [
    broadcastState.token,
    broadcastState.tokenExpiry,
    broadcastState.lastUpdated,
  ]);

  // 7. Event handlers
  const login = useCallback(async (): Promise<void> => {
    console.warn(
      '[AuthConsumerProvider] login() called from remote module. ' +
        'Remote modules should not initiate login directly. ' +
        'Please redirect users to the host application login page or use window.location to navigate.'
    );
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    debugLog(debugRef.current, 'Logout requested');
    const currentConfig = configRef.current;
    if (currentConfig?.onLogout) {
      await currentConfig.onLogout();
    } else {
      console.warn(
        '[AuthConsumerProvider] No logout handler provided by host. ' +
          'Ensure config.onLogout is passed from the host application.'
      );
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (isDebugMode && debugRef.current?.presetToken) {
      return debugRef.current.presetToken;
    }

    if (
      authState.accessToken &&
      !isExpiryTimestampExpired(
        authState.tokenExpiry,
        TOKEN_EXPIRY_BUFFER_SECONDS
      )
    ) {
      return authState.accessToken;
    }

    const currentConfig = configRef.current;
    if (currentConfig?.requestTokenRefresh) {
      try {
        const newToken = await currentConfig.requestTokenRefresh();
        if (newToken) {
          setAuthState((prev) => ({ ...prev, accessToken: newToken }));
          broadcastToken(newToken, authState.tokenExpiry);
          return newToken;
        }
      } catch (error) {
        debugLog(debugRef.current, 'Token refresh failed', { error });
      }
    }

    return authState.accessToken;
  }, [authState.accessToken, authState.tokenExpiry, isDebugMode]);

  const isTokenExpired = useCallback((): boolean => {
    return isExpiryTimestampExpired(
      authState.tokenExpiry,
      TOKEN_EXPIRY_BUFFER_SECONDS
    );
  }, [authState.tokenExpiry]);

  // 8. Memoized values
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

  // 9. Return JSX
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthConsumerProvider;
