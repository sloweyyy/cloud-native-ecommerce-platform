import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { EcommerceAuthProviderProps } from './types';
import { MsalAuthProvider } from './components/MsalAuthProvider';
import { InternalAuthProvider } from './components/InternalAuthProvider';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { debugLog } from './utils/auth';

// Create a default QueryClient
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * EcommerceAuthProvider
 *
 * Main authentication provider for the ecommerce platform.
 * Includes MSAL provider, QueryClient provider, and auth context.
 *
 * @example
 * ```tsx
 * import { EcommerceAuthProvider } from '@ecommerce-platform/auth-provider';
 *
 * const msalConfig = {
 *   clientId: 'your-client-id',
 *   authority: 'https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signupsignin',
 *   knownAuthorities: ['your-tenant.b2clogin.com'],
 * };
 *
 * function App() {
 *   return (
 *     <EcommerceAuthProvider msalConfig={msalConfig}>
 *       <YourApp />
 *     </EcommerceAuthProvider>
 *   );
 * }
 * ```
 */
export const EcommerceAuthProvider: React.FC<EcommerceAuthProviderProps> = ({
  children,
  msalConfig,
  debug = {},
}) => {
  const [isReady, setIsReady] = useState(false);
  const isDebugMode = Boolean(debug.presetToken);

  // Setup effect
  useEffect(() => {
    if (debug.presetToken) {
      debugLog(debug, 'Using preset token for development');
    }
    setIsReady(true);
  }, [debug]);

  // In debug mode, skip MSAL and use preset token
  if (isDebugMode) {
    return (
      <QueryClientProvider client={defaultQueryClient}>
        <AuthErrorBoundary debug={debug}>
          <InternalAuthProvider debug={debug}>
            {isReady ? children : null}
          </InternalAuthProvider>
        </AuthErrorBoundary>
      </QueryClientProvider>
    );
  }

  // Production mode with MSAL
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <AuthErrorBoundary debug={debug}>
        <MsalAuthProvider config={msalConfig}>
          <InternalAuthProvider debug={debug}>
            {isReady ? children : null}
          </InternalAuthProvider>
        </MsalAuthProvider>
      </AuthErrorBoundary>
    </QueryClientProvider>
  );
};

