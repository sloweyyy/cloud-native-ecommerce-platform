import React, { useMemo, createContext, useContext } from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, type ThemeConfig } from 'antd';
import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import {
  AuthConsumerProvider,
  useAuth,
} from '@ecommerce-platform/auth-provider';
import { themeConfig as sharedThemeConfig } from '@ecommerce-platform/shared-layout';
import { routeTree } from './routeTree.gen';
import { queryClient } from './services/queryClient';
import { getBasepath } from './utils/basepath';
import { createSearchSerializer } from './utils/searchParams';

type Props = AppInjectorProps;

type RouterContextValue = {
  config?: AppInjectorProps['config'];
};

const RouterContext = createContext<RouterContextValue>({});

const searchSerializer = createSearchSerializer([
  'brandId',
  'typeId',
  'cat',
  'sort',
  'filter',
  'page',
]);

function InnerApp() {
  const { config } = useContext(RouterContext);
  const { user, isAuthenticated } = useAuth();
  console.log('[store] user', user);
  const appContext = config?.appContext;
  const basePath = appContext?.basePath || getBasepath();

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

  const auth = {
    user,
    isAuthenticated: isAuthenticated ?? false,
    logout: () => undefined,
  };

  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        auth,
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

  const authConfig = useMemo(() => {
    if (!appContext) {
      return undefined;
    }

    return {
      user: appContext.user,
      token: appContext.token,
      tokenExpiry: appContext.tokenExpiry as number | null | undefined,
      isAuthenticated: appContext.isAuthenticated as boolean | undefined,
      requestTokenRefresh: appContext.requestTokenRefresh as
        | (() => Promise<string | null>)
        | undefined,
    };
  }, [appContext]);

  const themeConfig = sharedThemeConfig as ThemeConfig;

  return (
    <ConfigProvider theme={themeConfig}>
      <AuthConsumerProvider config={authConfig}>
        <QueryClientProvider client={queryClient}>
          <RouterContext.Provider value={{ config }}>
            <InnerApp />
          </RouterContext.Provider>
        </QueryClientProvider>
      </AuthConsumerProvider>
    </ConfigProvider>
  );
}

export default App;
