import React, { useMemo, ReactNode } from 'react';
import {
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider as AuthConsumerProviderOriginal,
  HostAuthContext,
  DebugOptions,
} from '@ecommerce-platform/auth-provider';
import { routeTree } from '../routeTree.gen';
import { queryClient } from '../services/queryClient';

// Type assertion to fix React types version mismatch in monorepo
const AuthConsumerProvider =
  AuthConsumerProviderOriginal as React.ComponentType<{
    hostAuth?: HostAuthContext;
    debug?: DebugOptions;
    children: ReactNode;
  }>;

type AccountModuleProps = AppInjectorProps;

interface RouterContext {
  queryClient: typeof queryClient;
  auth?: {
    user: unknown;
    isAuthenticated: boolean;
    logout: () => void;
  };
  config?: AppInjectorProps['config'];
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAccountRouter>;
  }
}

function createAccountRouter(basePath: string, initialPath = '/') {
  const memoryHistory = createMemoryHistory({
    initialEntries: [initialPath],
  });

  return createRouter({
    routeTree,
    history: memoryHistory,
    basepath: basePath,
    defaultPreload: 'intent',
    scrollRestoration: true,
    context: {
      queryClient,
      auth: undefined,
      config: undefined,
    } as RouterContext,
  });
}

/**
 * Build host auth context from app context
 */
function buildHostAuth(
  appContext?: Record<string, unknown>,
  onLogout?: () => void
): HostAuthContext | undefined {
  if (!appContext) {
    return undefined;
  }

  return {
    user: appContext.user as HostAuthContext['user'],
    token: appContext.token as string | null | undefined,
    tokenExpiry: appContext.tokenExpiry as number | undefined,
    isAuthenticated: appContext.isAuthenticated as boolean | undefined,
    requestTokenRefresh: appContext.requestTokenRefresh as
      | (() => Promise<string | null>)
      | undefined,
    onLogout,
  };
}

/**
 * Get debug options for development mode
 */
function getDebugOptions(): DebugOptions {
  // Only enable debug mode in development
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return {};
  }

  return {
    logging: true,
  };
}

/**
 * AccountModule
 *
 * Main entry point for the account micro-frontend.
 * Uses TanStack Router for file-based routing.
 */
const AccountModule: React.FC<AccountModuleProps> = ({ config }) => {
  const { appContext, onLogout } = config || {};
  const typedAppContext = appContext as Record<string, unknown> | undefined;

  const hostAuth = useMemo(
    () => buildHostAuth(typedAppContext, onLogout),
    [typedAppContext, onLogout]
  );

  const debug = useMemo(() => getDebugOptions(), []);

  // Get basePath from host config, defaults to '/' for standalone mode
  const basePath = (typedAppContext?.basePath as string) || '/';

  // Get initial path for memory history
  const initialPath = (typedAppContext?.initialPath as string) || '/';

  const router = useMemo(() => {
    const r = createAccountRouter(basePath, initialPath);
    // Update router context with config
    r.update({
      context: {
        queryClient,
        auth: hostAuth
          ? {
              user: hostAuth.user,
              isAuthenticated: hostAuth.isAuthenticated ?? false,
              logout: onLogout ? onLogout : () => undefined,
            }
          : undefined,
        config,
      },
    });
    return r;
  }, [basePath, initialPath, hostAuth, config, onLogout]);

  return (
    <AuthConsumerProvider hostAuth={hostAuth} debug={debug}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default AccountModule;
