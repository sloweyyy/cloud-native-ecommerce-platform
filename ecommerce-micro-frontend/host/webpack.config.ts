import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';
import { DefinePlugin } from 'webpack';
import * as dotenv from 'dotenv';
import * as path from 'path';

import baseConfig from './module-federation.config';

// Load environment variables from .env.development file
const env = dotenv.config({
  path: path.resolve(__dirname, '../.env.development')
}).parsed || {};

// Filter only NX_ prefixed variables and prepare for DefinePlugin
const envVars = Object.keys(env)
  .filter(key => key.startsWith('NX_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {} as Record<string, string>);

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
