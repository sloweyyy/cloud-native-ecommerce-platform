import React, { useMemo, useEffect, ReactNode } from 'react';
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

type StoreModuleProps = AppInjectorProps;

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
    router: ReturnType<typeof createStoreRouter>;
  }
}

/**
 * Build initial path from search params object
 */
function buildInitialPath(searchParams?: Record<string, string>): string {
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return '/';
  }
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}

function createStoreRouter(basePath: string, initialPath = '/') {
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

const StoreModule: React.FC<StoreModuleProps> = ({ config }) => {
  const appContext = config?.appContext as Record<string, unknown> | undefined;
  const hostAuth = useMemo(() => buildHostAuth(appContext), [appContext]);

  // Get basePath from host config, defaults to '/' for standalone mode
  const basePath = (appContext?.basePath as string) || '/';

  // Get initial search params from host and build initial path
  const initialSearchParams = appContext?.initialSearchParams as
    | Record<string, string>
    | undefined;
  const initialPath = buildInitialPath(initialSearchParams);

  // Get callback for syncing search params back to host
  const onSearchChange = appContext?.onSearchChange as
    | ((search: Record<string, unknown>) => void)
    | undefined;

  const router = useMemo(() => {
    const r = createStoreRouter(basePath, initialPath);
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

  // Subscribe to router changes and sync search params to host URL
  useEffect(() => {
    if (!onSearchChange) {
      return;
    }

    const unsubscribe = router.subscribe('onResolved', (event) => {
      const search = event.toLocation?.search;
      if (search) {
        // Convert search object to plain object, removing undefined values
        const cleanSearch: Record<string, unknown> = {};
        Object.entries(search).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            cleanSearch[key] = value;
          }
        });
        onSearchChange(cleanSearch);
      } else {
        // Clear search params
        onSearchChange({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, onSearchChange]);

  return (
    <AuthConsumerProvider hostAuth={hostAuth}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthConsumerProvider>
  );
};

export default StoreModule;
