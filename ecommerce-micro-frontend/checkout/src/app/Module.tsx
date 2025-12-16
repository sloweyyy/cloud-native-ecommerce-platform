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
} from '@ecommerce-platform/auth-provider';
import { routeTree } from '../routeTree.gen';
import { queryClient } from '../services/queryClient';

// Type assertion to fix React types version mismatch in monorepo
const AuthConsumerProvider =
  AuthConsumerProviderOriginal as React.ComponentType<{
    hostAuth?: HostAuthContext;
    children: ReactNode;
  }>;

type CheckoutModuleProps = AppInjectorProps;

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
    router: ReturnType<typeof createCheckoutRouter>;
  }
}

function createCheckoutRouter(basePath: string, initialPath = '/') {
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
  appContext?: Record<string, unknown>
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
  };
}

const CheckoutModule: React.FC<CheckoutModuleProps> = ({ config }) => {
  const appContext = config?.appContext as Record<string, unknown> | undefined;
  const hostAuth = useMemo(() => buildHostAuth(appContext), [appContext]);

  // Get basePath from host config, defaults to '/' for standalone mode
  const basePath = (appContext?.basePath as string) || '/';

  // Get initial path for memory history
  const initialPath = (appContext?.initialPath as string) || '/';

  const router = useMemo(() => {
    const r = createCheckoutRouter(basePath, initialPath);
    // Update router context with config
    r.update({
      context: {
        queryClient,
        auth: hostAuth
          ? {
              user: hostAuth.user,
              isAuthenticated: hostAuth.isAuthenticated ?? false,
              logout: () => undefined,
            }
          : undefined,
        config,
      },
    });
    return r;
  }, [basePath, initialPath, hostAuth, config]);

  return (
    <AuthConsumerProvider hostAuth={hostAuth}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default CheckoutModule;
