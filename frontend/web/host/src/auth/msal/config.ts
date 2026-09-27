/**
 * Host MSAL Configuration
 *
 * Creates MSAL configuration for the host application.
 */

import {
  PublicClientApplication,
  BrowserCacheLocation,
  Configuration,
  LogLevel,
} from '@azure/msal-browser';

/**
 * Azure AD B2C Configuration Constants
 *
 * Application: NextTech
 * Tenant: nexttechuit.onmicrosoft.com
 */
export const B2C_CONFIG = {
  TENANT_NAME: 'nexttechuit',
  CLIENT_ID: 'd0dafab9-cae6-426d-a516-eab88853767c',
  POLICY_NAME: 'B2C_1_SignInSignUp',
  B2C_DOMAIN: 'nexttechuit.b2clogin.com',
  TENANT_DOMAIN: 'nexttechuit.onmicrosoft.com',
} as const;

/**
 * Build the Azure AD B2C Authority URL
 */
export function buildB2CAuthority(): string {
  return `https://${B2C_CONFIG.TENANT_NAME}.b2clogin.com/${B2C_CONFIG.TENANT_DOMAIN}/${B2C_CONFIG.POLICY_NAME}/v2.0/`;
}

/**
 * Build the API scope
 */
export function buildApiScope(): string {
  return `https://${B2C_CONFIG.TENANT_DOMAIN}/${B2C_CONFIG.CLIENT_ID}/access_as_user`;
}

/**
 * Default scopes
 */
export const defaultScopes: string[] = ['openid', 'profile', buildApiScope()];

/**
 * Get redirect URI
 */
function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:4200';
}

/**
 * Create MSAL Configuration
 */
export function createMsalConfig(): Configuration {
  return {
    auth: {
      clientId: process.env.NX_AZURE_CLIENT_ID || B2C_CONFIG.CLIENT_ID,
      authority: buildB2CAuthority(),
      knownAuthorities: [B2C_CONFIG.B2C_DOMAIN],
      redirectUri: getRedirectUri(),
      postLogoutRedirectUri: getRedirectUri(),
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (
          level: LogLevel,
          message: string,
          containsPii: boolean
        ) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error('[MSAL]', message);
              break;
            case LogLevel.Warning:
              console.warn('[MSAL]', message);
              break;
            case LogLevel.Info:
              console.info('[MSAL]', message);
              break;
            case LogLevel.Verbose:
              console.debug('[MSAL]', message);
              break;
          }
        },
        logLevel:
          process.env.NODE_ENV === 'development'
            ? LogLevel.Info
            : LogLevel.Error,
        piiLoggingEnabled: false,
      },
      allowNativeBroker: false,
    },
  };
}

/**
 * MSAL Configuration for the Host
 */
export const msalConfig = createMsalConfig();

/**
 * Login request configuration
 */
export const loginRequest = {
  scopes: defaultScopes,
};

/**
 * Token request configuration
 */
export const tokenRequest = {
  scopes: defaultScopes,
};

/**
 * Scopes export
 */
export const scopes = defaultScopes;

/**
 * Create and export the MSAL instance singleton
 */
let msalInstance: PublicClientApplication | null = null;

export const getMsalInstance = (): PublicClientApplication => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

/**
 * Initialize MSAL instance
 */
export const initializeMsal = async (): Promise<PublicClientApplication> => {
  const instance = getMsalInstance();
  await instance.initialize();
  return instance;
};

/**
 * Host MSAL config export (for compatibility)
 */
export const hostMsalConfig = {
  msalConfig,
  loginRequest,
  tokenRequest,
  scopes,
};
