import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack.js';

import baseConfig from './module-federation.config';

export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(baseConfig, {
    dts: false,
  })
);
