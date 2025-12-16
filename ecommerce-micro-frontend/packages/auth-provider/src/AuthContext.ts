import { createContext } from 'react';
import type { AuthContextType } from './types';
import { defaultAuthContextValue } from './types';

/**
 * React context for authentication state and operations
 */
export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

AuthContext.displayName = 'EcommerceAuthContext';

