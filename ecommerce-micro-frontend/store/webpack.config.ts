import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { DefinePlugin } from 'webpack';
import * as dotenv from 'dotenv';
import * as path from 'path';

import baseConfig from './module-federation.config';

// Load environment variables from .env.development file
const envPath = path.resolve(__dirname, '../.env.development');
console.log('[webpack.config] Loading .env from:', envPath);

const env = dotenv.config({
  path: envPath
}).parsed || {};

console.log('[webpack.config] Loaded env vars:', env);

// Filter only NX_ prefixed variables and prepare for DefinePlugin
const envVars = Object.keys(env)
  .filter(key => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {} as Record<string, string>);

console.log('[webpack.config] Injecting env vars:', envVars);

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(baseConfig, {
    dts: false,
  }),
  (config) => {
    // Add DefinePlugin to inject environment variables
    config.plugins = config.plugins || [];
    config.plugins.push(
      new DefinePlugin(envVars)
    );
    return config;
  }
);
