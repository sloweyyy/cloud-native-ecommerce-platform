import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'checkout',
  exposes: {
    './ConsoleMicroApp': './src/remote-entry.ts',
  },
};

export default config;
