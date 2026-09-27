import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'store',
  exposes: {
    './ConsoleMicroApp': './src/remote-entry.ts',
  },
};

export default config;
