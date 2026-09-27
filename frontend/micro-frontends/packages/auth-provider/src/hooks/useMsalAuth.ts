import { useCallback, useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import type { AuthState, MsalConfigOptions } from '../types';
import { accountInfoToAuthUser, createLoadingState } from '../utils/auth';
import { getTokenExpiry } from '../utils/token';
import { DEFAULT_SCOPES } from '../constants';

interface UseMsalAuthOptions {
  scopes?: string[];
  onError?: (error: Error) => void;
}

interface UseMsalAuthResult extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

/**
 * Hook for MSAL authentication operations
 */
export function useMsalAuth(
  _config: MsalConfigOptions,
  options: UseMsalAuthOptions = {}
): UseMsalAuthResult {
  const { scopes = DEFAULT_SCOPES, onError } = options;

  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(accounts[0] || null);

  const [authState, setAuthState] = useState<AuthState>(createLoadingState());

  // Update state when MSAL state changes
  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (isAuthenticated && account) {
      const user = accountInfoToAuthUser(account);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken: null, // Will be fetched on demand
        tokenExpiry: null,
        error: null,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        tokenExpiry: null,
        error: null,
      });
    }
  }, [isAuthenticated, account, inProgress]);

  const login = useCallback(async (): Promise<void> => {
    try {
      await instance.loginRedirect({
        scopes,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setAuthState((prev) => ({ ...prev, error: err }));
      onError?.(err);
    }
  }, [instance, scopes, onError]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setAuthState((prev) => ({ ...prev, error: err }));
      onError?.(err);
    }
  }, [instance, onError]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        scopes,
        account,
      });

      const token = response.accessToken;
      const tokenExpiry = getTokenExpiry(token);

      setAuthState((prev) => ({
        ...prev,
        accessToken: token,
        tokenExpiry,
      }));

      return token;
    } catch (error) {
      // Try interactive token acquisition via redirect
      try {
        // acquireTokenRedirect returns void as it redirects the browser
        await instance.acquireTokenRedirect({
          scopes,
          account,
        });
        // Will not reach here as browser redirects
        return null;
      } catch (interactiveError) {
        const err =
          interactiveError instanceof Error
            ? interactiveError
            : new Error(String(interactiveError));
        setAuthState((prev) => ({ ...prev, error: err }));
        onError?.(err);
        return null;
      }
    }
  }, [instance, account, scopes, onError]);

  return {
    ...authState,
    login,
    logout,
    getAccessToken,
  };
}
