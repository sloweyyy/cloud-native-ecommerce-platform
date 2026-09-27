import React, { useMemo, createContext, useContext } from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider,
  HostAuthContext,
} from '@ecommerce-platform/auth-provider';
import { ConfigProvider } from 'antd';
import { adminThemeConfig } from './config/theme';
import { routeTree } from './routeTree.gen';
import { queryClient } from './services/queryClient';
import { getBasepath } from './utils/basepath';
import { createSearchSerializer } from './utils/searchParams';

type Props = AppInjectorProps;

type RouterContextValue = {
  hostAuth?: HostAuthContext;
  config?: AppInjectorProps['config'];
  onLogout?: () => void;
};

const RouterContext = createContext<RouterContextValue>({});

const searchSerializer = createSearchSerializer([
  'group',
  'service',
  'configKey',
  'env',
  'tab',
]);

function InnerApp() {
  const { hostAuth, config, onLogout } = useContext(RouterContext);

  const appContext = config?.appContext;
  const basePath = (appContext?.basePath as string) || getBasepath();

  const router = useMemo(() => {
    return createRouter({
      routeTree,
      basepath: basePath,
      defaultPreload: 'intent',
      scrollRestoration: true,
      context: {
        queryClient,
        auth: {
          user: null,
          isAuthenticated: false,
          logout: () => undefined,
        },
      },
      stringifySearch: (search) => {
        const str = searchSerializer.stringify(search);
        return str ? `?${str}` : '';
      },
      parseSearch: (searchStr) => {
        return searchSerializer.parse(searchStr);
      },
    });
  }, [basePath]);

  const auth = hostAuth
    ? {
        user: hostAuth.user,
        isAuthenticated: hostAuth.isAuthenticated ?? false,
        logout: onLogout ? onLogout : () => undefined,
      }
    : {
        user: null,
        isAuthenticated: false,
        logout: () => undefined,
      };

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        auth,
        config,
      }}
    />
  );
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

function App(props: Props) {
  // 1. Props destructuring
  const { config } = props;
  const { appContext, onLogout } = config || {};

  // 2. Memoized values
  const hostAuth = useMemo<HostAuthContext | undefined>(() => {
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
  }, [appContext, onLogout]);

  // 3. Main render
  return (
    <ConfigProvider theme={adminThemeConfig}>
      <AuthConsumerProvider config={hostAuth}>
        <QueryClientProvider client={queryClient}>
          <RouterContext.Provider value={{ hostAuth, config, onLogout }}>
            <InnerApp />
          </RouterContext.Provider>
        </QueryClientProvider>
      </AuthConsumerProvider>
    </ConfigProvider>
  );
}

export default App;
