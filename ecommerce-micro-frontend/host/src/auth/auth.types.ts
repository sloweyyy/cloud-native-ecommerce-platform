/**
 * Host Module - Authentication Types
 */

export interface User {
  username: string;
  displayName?: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  username: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

