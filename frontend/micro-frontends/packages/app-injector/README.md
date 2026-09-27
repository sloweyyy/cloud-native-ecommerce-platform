# @ecommerce-platform/app-injector

A lightweight, type-safe micro-frontend app injector for React applications. Provides standardized inject/unmount methods with automatic React 16/17/18+ support.

## Features

- 🚀 **React Version Agnostic** - Automatically detects and uses the appropriate React rendering API (createRoot for 18+, render for 16/17)
- 🔄 **Retry Logic** - Enhanced injector with configurable retry mechanism for resilient mounting
- 📦 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎯 **Minimal Dependencies** - Only requires React and ReactDOM as peer dependencies
- 🔧 **Environment Detection** - Built-in utilities for detecting production/staging/development environments
- 📝 **Debug Mode** - Optional detailed logging for troubleshooting

## Installation

```bash
# npm
npm install @ecommerce-platform/app-injector

# yarn
yarn add @ecommerce-platform/app-injector

# pnpm
pnpm add @ecommerce-platform/app-injector
```

### Peer Dependencies

Make sure you have React and ReactDOM installed:

```bash
npm install react react-dom
```

## Quick Start

### Basic Usage

```tsx
import { createAppInjector } from '@ecommerce-platform/app-injector';
import MyApp from './MyApp';

// Create an injector for your app
const MyAppInjector = createAppInjector(MyApp);

// Inject into a container element
MyAppInjector.inject('app-container', {
  config: {
    appContext: {
      user: { id: '1', email: 'user@example.com' },
      theme: 'dark',
    },
    onNavigate: (path) => console.log('Navigate to:', path),
  },
});

// Unmount when needed
MyAppInjector.unmount('app-container');
```

### Enhanced Usage with Retry Logic

```tsx
import { createEnhancedAppInjector } from '@ecommerce-platform/app-injector';
import MyApp from './MyApp';

const MyAppInjector = createEnhancedAppInjector(MyApp, {
  maxRetries: 3,
  retryDelay: 1000,
  elementTimeout: 5000,
  debug: true,
  onSuccess: (id) => console.log(`Mounted in ${id}`),
  onFailure: (id, error) => console.error(`Failed to mount in ${id}`, error),
});

// Async injection with retry
await MyAppInjector.inject('app-container', {
  config: {
    appContext: { user: currentUser },
  },
});

// Check if currently mounted
if (MyAppInjector.isInjected('app-container')) {
  console.log('App is mounted');
}
```

## API Reference

### `createAppInjector(AppComponent)`

Creates a basic app injector.

**Parameters:**
- `AppComponent` - React component to inject

**Returns:** `AppInjector`
- `inject(parentElementId, props?)` - Mount the component
- `unmount(parentElementId)` - Unmount the component

### `createEnhancedAppInjector(AppComponent, options?)`

Creates an enhanced app injector with retry logic.

**Parameters:**
- `AppComponent` - React component to inject
- `options` - Configuration options:
  - `maxRetries` (default: 3) - Number of retry attempts
  - `retryDelay` (default: 1000) - Delay between retries in ms
  - `elementTimeout` (default: 5000) - Timeout for element detection
  - `debug` (default: false) - Enable debug logging
  - `onSuccess` - Callback on successful injection
  - `onFailure` - Callback on failed injection

**Returns:** `EnhancedAppInjector`
- `inject(parentElementId, props?)` - Async mount with retry
- `unmount(parentElementId)` - Unmount the component
- `isInjected(parentElementId)` - Check if mounted

### Environment Utilities

```tsx
import {
  getEnvironment,
  isProductionEnv,
  isStagingEnv,
  isDevelopmentEnv,
  getApiBaseUrl,
  configureEnvironment,
} from '@ecommerce-platform/app-injector';

// Check current environment
console.log(getEnvironment()); // 'development' | 'staging' | 'production'

// Configure for your project
configureEnvironment({
  productionHostname: 'myapp.com',
  stagingHostname: 'staging.myapp.com',
  developmentHostnames: ['localhost', 'dev.local'],
  apiUrls: {
    production: 'https://api.myapp.com',
    staging: 'https://api.staging.myapp.com',
    development: 'http://localhost:8080',
  },
});
```

### Custom Environment Detector

```tsx
import { createEnvironmentDetector } from '@ecommerce-platform/app-injector';

const env = createEnvironmentDetector({
  productionHostname: 'myapp.com',
  stagingHostname: 'staging.myapp.com',
  developmentHostnames: ['localhost'],
  apiUrls: {
    production: 'https://api.myapp.com',
    staging: 'https://api.staging.myapp.com',
    development: 'http://localhost:8080',
  },
});

console.log(env.getEnvironment()); // 'development'
console.log(env.getApiBaseUrl()); // 'http://localhost:8080'
```

## Types

### AppInjectorProps

Props passed to the injected component:

```typescript
interface AppInjectorProps {
  config?: MicroFrontendConfig;
  [key: string]: unknown;
}

interface MicroFrontendConfig {
  appContext?: AppContext;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
  onError?: (error: Error) => void;
}

interface AppContext {
  user?: User | null;
  token?: string | null;
  theme?: 'light' | 'dark';
  locale?: string;
  basePath?: string;
  apiBaseUrl?: string;
}
```

## Use with Module Federation

This library is designed to work seamlessly with Webpack Module Federation:

```tsx
// remote-entry.ts (in your micro-frontend)
import { createAppInjector } from '@ecommerce-platform/app-injector';
import App from './app/App';

export const StoreAppInjector = createAppInjector(App);
export default StoreAppInjector;
```

```tsx
// host application
import StoreAppInjector from 'store/Module';

// Mount the micro-frontend
StoreAppInjector.inject('store-container', {
  config: {
    appContext: { user: currentUser },
    onNavigate: (path) => navigate(path),
  },
});
```

## React Version Support

| React Version | Rendering API Used |
|--------------|-------------------|
| 18.x, 19.x   | `createRoot`      |
| 16.x, 17.x   | `ReactDOM.render` |

The library automatically detects the React version and uses the appropriate API.

## License

MIT

