import { TOKEN_EXPIRY_BUFFER_SECONDS } from '../constants';

/**
 * Parse JWT token payload (internal helper)
 */
function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Get token expiry timestamp from JWT
 */
export function getTokenExpiry(token: string): number | null {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000; // Convert to milliseconds
}

/**
 * Check if token is expired
 */
export function isTokenExpired(
  token: string,
  bufferSeconds: number = TOKEN_EXPIRY_BUFFER_SECONDS
): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry - bufferSeconds * 1000;
}

/**
 * Check if expiry timestamp is expired
 */
export function isExpiryTimestampExpired(
  expiryTimestamp: number | null,
  bufferSeconds: number = TOKEN_EXPIRY_BUFFER_SECONDS
): boolean {
  if (!expiryTimestamp) return true;
  return Date.now() >= expiryTimestamp - bufferSeconds * 1000;
}
