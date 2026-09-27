import React, { ReactNode } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { EcommerceAuthProvider as EcommerceAuthProviderOriginal, MsalConfigOptions } from '@ecommerce-platform/auth-provider';
import {
  B2C_CONFIG,
  buildB2CAuthority,
  defaultScopes,
} from '../auth/msal/config';
import { AppConfigProvider, useAppConfig } from '../context/AppConfigContext';
import { routes } from '../routes';
import { themeConfig } from '../config/theme';
import '../i18n/config';
import '../styles.less';

// Type assertion to fix React types version mismatch in monorepo
const EcommerceAuthProvider = EcommerceAuthProviderOriginal as React.ComponentType<{
  msalConfig: MsalConfigOptions;
  children: ReactNode;
}>;

/**
 * MSAL configuration for the auth provider package
 */
const msalConfig = {
  clientId: process.env.NX_AZURE_CLIENT_ID || B2C_CONFIG.CLIENT_ID,
  authority: buildB2CAuthority(),
  knownAuthorities: [B2C_CONFIG.B2C_DOMAIN],
  scopes: defaultScopes,
};

/**
 * Router Component that uses useRoutes hook
 */
function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

/**
 * Theme Wrapper Component
 *
 * This internal component consumes the theme from AppConfigContext
 * and applies it to the Ant Design ConfigProvider.
 * Must be rendered inside AppConfigProvider.
 */
function ThemedApp() {
  const { appContext } = useAppConfig();

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm:
          appContext.theme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

/**
 * Main Application Component
 *
 * This component sets up the routing and layout for the host application.
 * It wraps all micro-frontends with the AppConfigProvider to provide
 * centralized configuration and context.
 *
 * Routes are defined in routes.tsx using the refactored micro frontend architecture.
 *
 * Theme is now managed through AppConfigContext for proper state management
 * and synchronization across the application.
 *
 * Authentication is managed by @ecommerce-platform/auth-provider using Azure AD B2C.
 */
export function App() {
  return (
    <BrowserRouter>
      <EcommerceAuthProvider msalConfig={msalConfig}>
        <AppConfigProvider>
          <ThemedApp />
        </AppConfigProvider>
      </EcommerceAuthProvider>
    </BrowserRouter>
  );
}

export default App;
