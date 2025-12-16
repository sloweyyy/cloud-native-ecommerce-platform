import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './types';

/**
 * Hook to access authentication context
 *
 * @returns Authentication context with user, token, and auth operations
 * @throws Error if used outside of EcommerceAuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Hello, {user?.displayName}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an EcommerceAuthProvider');
  }

  return context;
}

