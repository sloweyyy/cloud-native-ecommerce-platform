import {
  AUTH_TOKEN_KEY,
  AUTH_TOKEN_EXPIRY_KEY,
  AUTH_USER_KEY,
} from '../constants';
import type { AuthUser } from '../types';

/**
 * Safe localStorage access (handles SSR and errors)
 */
export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

/**
 * Get stored auth token
 */
export function getStoredToken(): string | null {
  return safeStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set auth token in storage
 */
export function setStoredToken(token: string): void {
  safeStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove auth token from storage
 */
export function removeStoredToken(): void {
  safeStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Get stored token expiry timestamp
 */
export function getStoredTokenExpiry(): number | null {
  const expiry = safeStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Set token expiry timestamp in storage
 */
export function setStoredTokenExpiry(expiry: number): void {
  safeStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expiry.toString());
}

/**
 * Remove token expiry from storage
 */
export function removeStoredTokenExpiry(): void {
  safeStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
}

/**
 * Get stored user info
 */
export function getStoredUser(): AuthUser | null {
  const userJson = safeStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Set user info in storage
 */
export function setStoredUser(user: AuthUser): void {
  safeStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Remove user info from storage
 */
export function removeStoredUser(): void {
  safeStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Clear all auth data from storage
 */
export function clearAuthStorage(): void {
  removeStoredToken();
  removeStoredTokenExpiry();
  removeStoredUser();
}
