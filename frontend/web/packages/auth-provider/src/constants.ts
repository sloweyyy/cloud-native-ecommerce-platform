/**
 * Storage key for authentication token
 */
export const AUTH_TOKEN_KEY = 'ecommerce-auth-token';

/**
 * Storage key for token expiry timestamp
 */
export const AUTH_TOKEN_EXPIRY_KEY = 'ecommerce-auth-token-expiry';

/**
 * Storage key for user info
 */
export const AUTH_USER_KEY = 'ecommerce-auth-user';

/**
 * Event name for token broadcast between host and remotes
 */
export const TOKEN_BROADCAST_EVENT = 'ecommerce:token:refresh';

/**
 * Event name for auth state broadcast
 */
export const AUTH_STATE_BROADCAST_EVENT = 'ecommerce:auth:state';

/**
 * Default token expiry buffer in seconds (refresh 60s before expiry)
 */
export const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

/**
 * Default scopes for token requests
 */
export const DEFAULT_SCOPES = ['openid', 'profile', 'email'];
