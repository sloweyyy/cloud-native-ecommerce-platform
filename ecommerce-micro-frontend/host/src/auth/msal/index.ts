/**
 * Host MSAL Auth Module
 *
 * Only exports B2C configuration. Auth components and hooks are now
 * provided by @ecommerce-platform/auth-provider package.
 */

// Configuration
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
} from './config';
