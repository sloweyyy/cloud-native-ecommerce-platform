import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { DefinePlugin } from 'webpack';

import baseConfig from './module-federation.config';

const envVars = Object.keys(process.env)
  .filter((key) => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return acc;
  }, {} as Record<string, string>);

console.log('[checkout/webpack.config.prod] Injecting env vars:', Object.keys(envVars));

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(baseConfig, {
    dts: false,
  }),
  (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(new DefinePlugin(envVars));

    if (config.resolve) {
      const path = require('path');
      config.resolve.alias = {
        ...config.resolve.alias,
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@constants': path.resolve(__dirname, './src/config'),
        '@helpers': path.resolve(__dirname, './src/helpers'),
        '@libs': path.resolve(__dirname, './src/libs'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@ecommerce-platform/app-injector': path.resolve(
          __dirname,
          '../packages/app-injector/dist/index.js'
        ),
        '@ecommerce-platform/auth-provider': path.resolve(
          __dirname,
          '../packages/auth-provider/dist/index.js'
        ),
      };
    }

    return config;
  }
);
