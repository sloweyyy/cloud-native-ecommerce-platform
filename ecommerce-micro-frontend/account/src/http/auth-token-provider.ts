/**
 * Account Module - Auth Token Provider
 *
 * Provides a way to inject token acquisition logic into the HTTP client
 * from the React auth context. This bridges the gap between the
 * React context-based auth and the singleton HTTP client.
 */

/**
 * Token provider function type
 */
export type TokenProvider = () => Promise<string | null>;

/**
 * User info provider function type
 */
export type UserInfoProvider = () => { username?: string; email?: string } | null;

/**
 * Singleton token provider manager
 */
class AuthTokenProviderManager {
  private tokenProvider: TokenProvider | null = null;
  private userInfoProvider: UserInfoProvider | null = null;
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Set the token provider function
   * Called by the auth context when it mounts
   */
  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  /**
   * Set the user info provider function
   * Called by the auth context when it mounts
   */
  setUserInfoProvider(provider: UserInfoProvider): void {
    this.userInfoProvider = provider;
  }

  /**
   * Clear providers (called on logout or unmount)
   */
  clearProviders(): void {
    this.tokenProvider = null;
    this.userInfoProvider = null;
    this.cachedToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Set cached token (for synchronous access)
   */
  setCachedToken(token: string | null, expiry?: number | null): void {
    this.cachedToken = token;
    this.tokenExpiry = expiry ?? null;
  }

  /**
   * Get token synchronously (returns cached token)
   * Used by HTTP interceptors that need sync access
   */
  getTokenSync(): string | null {
    // Check if cached token is still valid (with 1 minute buffer)
    if (this.cachedToken && this.tokenExpiry) {
      const isExpired = Date.now() >= this.tokenExpiry - 60000;
      if (isExpired) {
        // Token expired, trigger async refresh
        this.getTokenAsync().catch(console.error);
        return null;
      }
    }
    return this.cachedToken;
  }

  /**
   * Get token asynchronously (refreshes if needed)
   * Used when we can await the token
   */
  async getTokenAsync(): Promise<string | null> {
    if (this.tokenProvider) {
      try {
        const token = await this.tokenProvider();
        if (token) {
          this.cachedToken = token;
        }
        return token;
      } catch (error) {
        console.error('[AuthTokenProvider] Failed to get token:', error);
        return this.cachedToken;
      }
    }
    return this.cachedToken;
  }

  /**
   * Get user info synchronously
   */
  getUserInfo(): { username?: string; email?: string } | null {
    if (this.userInfoProvider) {
      return this.userInfoProvider();
    }
    return null;
  }

  /**
   * Check if provider is configured
   */
  hasProvider(): boolean {
    return this.tokenProvider !== null;
  }
}

/**
 * Global auth token provider instance
 */
export const authTokenProvider = new AuthTokenProviderManager();

/**
 * Hook helper to connect auth context to token provider
 */
export function connectAuthToTokenProvider(
  getAccessToken: () => Promise<string | null>,
  getUserInfo: () => { username?: string; email?: string } | null,
  currentToken?: string | null,
  tokenExpiry?: number | null
): () => void {
  authTokenProvider.setTokenProvider(getAccessToken);
  authTokenProvider.setUserInfoProvider(getUserInfo);
  
  if (currentToken) {
    authTokenProvider.setCachedToken(currentToken, tokenExpiry);
  }

  // Return cleanup function
  return () => {
    authTokenProvider.clearProviders();
  };
}

