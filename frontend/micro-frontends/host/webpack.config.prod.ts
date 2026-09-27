import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { ModuleFederationConfig } from '@nx/module-federation';
import { DefinePlugin } from 'webpack';

import baseConfig from './module-federation.config';

// Use Amplify environment variables directly (no .env files)
// Required env vars should be set in Amplify Console:
// - NX_API_BASE_URL: API Gateway URL
// - NX_API_TIMEOUT: API timeout in ms (optional, defaults to 30000)
// - NX_USE_MOCK_DATA: Enable mock data (optional, defaults to false)
// - NX_ENABLE_AUTHENTICATION: Enable auth (optional, defaults to true)
// - NX_LOG_LEVEL: Log level (optional, defaults to 'info')

// Filter only NX_ prefixed variables from process.env
const envVars = Object.keys(process.env)
  .filter(key => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return acc;
  }, {} as Record<string, string>);

console.log('[host/webpack.config.prod] Injecting env vars:', Object.keys(envVars));

const prodConfig: ModuleFederationConfig = {
  ...baseConfig,
  remotes: [],
};

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(prodConfig, { dts: false }),
  (config) => {
    // Add DefinePlugin to inject environment variables
    config.plugins = config.plugins || [];
    config.plugins.push(
      new DefinePlugin(envVars)
    );
    return config;
  }
);
