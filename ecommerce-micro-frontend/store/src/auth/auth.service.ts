/**
 * Store Module - Authentication Service
 */

import { AuthStorage } from './auth.storage';
import type { User, AuthState, LoginRequest, LoginResponse } from './auth.types';

export class AuthService {
  private static listeners = new Set<(state: AuthState) => void>();

  static getAuthState(): AuthState {
    const user = AuthStorage.getUser();
    return {
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    };
  }

  static async login(request: LoginRequest): Promise<LoginResponse> {
    if (!request.username || request.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    const username = request.username.trim();

    const user: User = {
      username,
      displayName: username,
      email: `${username}@example.com`,
    };

    AuthStorage.setUser(user);
    this.notifyListeners();

    return {
      user,
      token: `demo-token-${username}`,
    };
  }

  static logout(): void {
    AuthStorage.clear();
    this.notifyListeners();
  }

  static getCurrentUser(): User | null {
    return AuthStorage.getUser();
  }

  static getCurrentUsername(): string {
    return AuthStorage.getCurrentUsername() || 'guest';
  }

  static isAuthenticated(): boolean {
    return AuthStorage.isAuthenticated();
  }

  static subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[store/auth] Error in auth state listener:', error);
      }
    });
  }

  static requireAuth(): User {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }
}

