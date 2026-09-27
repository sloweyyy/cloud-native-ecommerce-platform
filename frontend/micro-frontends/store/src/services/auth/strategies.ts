import { getStoredToken } from '@ecommerce-platform/auth-provider';

/**
 * Authentication strategy interface for different auth schemes
 */
export interface AuthStrategy {
  getAuthHeader(): Record<string, string>;
  getStrategyName(): string;
}

/**
 * Universal authentication strategy class that handles different auth types
 */
export class AuthStrategyHandler implements AuthStrategy {
  private strategyType: AuthStrategyType;

  constructor(type: AuthStrategyType) {
    this.strategyType = type;
  }

  getAuthHeader(): Record<string, string> {
    switch (this.strategyType) {
      case 'bearer': {
        const token = getStoredToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
      case 'none':
      default:
        return {};
    }
  }

  getStrategyName(): string {
    return this.strategyType;
  }
}

/**
 * Bearer token authentication strategy (for BackOffice APIs)
 * Uses Concedo auth token with "Bearer" prefix
 */
export class BearerAuthStrategy extends AuthStrategyHandler {
  constructor() {
    super('bearer');
  }
}

/**
 * No authentication strategy (for public APIs)
 */
export class NoAuthStrategy extends AuthStrategyHandler {
  constructor() {
    super('none');
  }
}

/**
 * Factory function to create auth strategies
 */
export function createAuthStrategy(type: AuthStrategyType): AuthStrategy {
  switch (type) {
    case 'bearer':
      return new BearerAuthStrategy();
    case 'none':
      return new NoAuthStrategy();
    default:
      throw new Error(`Unknown auth strategy type: ${type}`);
  }
}

/**
 * Auth strategy types for type safety
 */
export type AuthStrategyType = 'bearer' | 'none';
