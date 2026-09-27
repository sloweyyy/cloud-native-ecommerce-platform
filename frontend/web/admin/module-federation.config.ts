import { ModuleFederationConfig } from '@nx/module-federation';

// Libraries holding React context / module state must be a single instance
// across host and remotes (keep in sync with every module-federation.config.ts).
const SINGLETON_LIBRARIES = ['react', 'react-dom', 'react-router'];

const config: ModuleFederationConfig = {
  name: 'admin',
  exposes: {
    './ConsoleMicroApp': './src/remote-entry.ts',
  },
  shared: (libraryName, sharedConfig) =>
    SINGLETON_LIBRARIES.includes(libraryName)
      ? { ...sharedConfig, singleton: true }
      : sharedConfig,
  // Always share react-router; Nx derives singleton/strictVersion/requiredVersion
  // from the root package.json for string entries.
  additionalShared: ['react-router'],
};

export default config;
