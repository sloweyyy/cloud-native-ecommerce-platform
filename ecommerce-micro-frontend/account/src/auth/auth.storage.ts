/**
 * Account Module - Authentication Storage
 */

import type { User } from './auth.types';

const STORAGE_KEYS = {
  USER: 'ecommerce_user',
  TOKEN: 'ecommerce_token',
} as const;

export class AuthStorage {
  private static storage = typeof window !== 'undefined' ? window.localStorage : null;

  static getUser(): User | null {
    if (!this.storage) return null;

    try {
      const userJson = this.storage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('[account/auth] Failed to parse user from storage:', error);
      return null;
    }
  }

  static setUser(user: User): void {
    if (!this.storage) return;

    try {
      this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('[account/auth] Failed to save user to storage:', error);
    }
  }

  static getToken(): string | null {
    if (!this.storage) return null;
    return this.storage.getItem(STORAGE_KEYS.TOKEN);
  }

  static setToken(token: string): void {
    if (!this.storage) return;
    this.storage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  static clear(): void {
    if (!this.storage) return;
    this.storage.removeItem(STORAGE_KEYS.USER);
    this.storage.removeItem(STORAGE_KEYS.TOKEN);
  }

  static isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  static getCurrentUsername(): string | null {
    const user = this.getUser();
    return user?.username || null;
  }
}

