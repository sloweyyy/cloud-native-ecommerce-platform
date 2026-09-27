import React, { useMemo, useEffect, useState } from 'react';
import {
  PublicClientApplication,
  Configuration,
  LogLevel,
  EventType,
  AuthenticationResult,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import type { MsalConfigOptions } from '../types';
import { getCurrentOrigin } from '../utils/auth';

interface MsalAuthProviderProps {
  children: React.ReactNode;
  config: MsalConfigOptions;
}

/**
 * Create MSAL configuration from options
 */
function createMsalConfiguration(options: MsalConfigOptions): Configuration {
  const redirectUri = options.redirectUri || getCurrentOrigin();

  return {
    auth: {
      clientId: options.clientId,
      authority: options.authority,
      knownAuthorities: options.knownAuthorities,
      redirectUri,
      postLogoutRedirectUri: options.postLogoutRedirectUri || redirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            default:
              break;
          }
        },
      },
    },
  };
}

/**
 * MsalAuthProvider
 *
 * Wraps application with MSAL provider for Azure AD authentication.
 * Handles redirect responses and initializes MSAL instance properly.
 */
export const MsalAuthProvider: React.FC<MsalAuthProviderProps> = ({
  children,
  config,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const msalInstance = useMemo(() => {
    const msalConfig = createMsalConfiguration(config);
    return new PublicClientApplication(msalConfig);
  }, [config]);

  // Initialize MSAL and handle redirect response
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        // Initialize MSAL instance
        await msalInstance.initialize();

        // Handle redirect response after login
        const response = await msalInstance.handleRedirectPromise();

        if (response) {
          console.log(
            '[MSAL] Redirect login successful:',
            response.account?.username
          );
          // Set the active account
          msalInstance.setActiveAccount(response.account);
        } else {
          // Check if there's already an active account
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
          }
        }

        // Register event callback for login success
        msalInstance.addEventCallback((event) => {
          if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            msalInstance.setActiveAccount(payload.account);
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('[MSAL] Initialization error:', error);
        setIsInitialized(true); // Still allow app to render
      }
    };

    initializeMsal();
  }, [msalInstance]);

  // Show nothing until MSAL is initialized
  if (!isInitialized) {
    return null;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};
