// CI Test: Updated checkout App.tsx to trigger frontend-quality job
import React, { useMemo, createContext, useContext } from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, type ThemeConfig } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider,
  HostAuthContext,
} from '@ecommerce-platform/auth-provider';
import { themeConfig as sharedThemeConfig } from '@ecommerce-platform/shared-layout';
import { routeTree } from './routeTree.gen';
import { queryClient } from './services/queryClient';
import { getBasepath } from './utils/basepath';
import { createSearchSerializer } from './utils/searchParams';

type Props = AppInjectorProps;

type RouterContextValue = {
  hostAuth?: HostAuthContext;
  config?: AppInjectorProps['config'];
};

const RouterContext = createContext<RouterContextValue>({});

const searchSerializer = createSearchSerializer([]);

function InnerApp() {
  const { hostAuth, config } = useContext(RouterContext);

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
        logout: () => undefined,
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
  const { config } = props;
  const { appContext } = config || {};

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
    };
  }, [appContext]);

  // Cast themeConfig to avoid type conflicts between different antd versions
  const themeConfig = sharedThemeConfig as ThemeConfig;

  return (
    <ConfigProvider theme={themeConfig}>
      <AuthConsumerProvider hostAuth={hostAuth}>
        <QueryClientProvider client={queryClient}>
          <RouterContext.Provider value={{ hostAuth, config }}>
            <InnerApp />
          </RouterContext.Provider>
        </QueryClientProvider>
      </AuthConsumerProvider>
    </ConfigProvider>
  );
}

export default App;

