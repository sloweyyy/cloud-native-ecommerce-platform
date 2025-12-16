/**
 * Micro Frontend Registry
 * 
 * Central registry for all micro frontends in the ecommerce platform.
 * Each consumer micro frontend registers itself here with its configuration.
 * 
 * Architecture:
 * - Host knows nothing about specific business logic
 * - Consumers register themselves with name, remote URL, and exposed module
 * - Dynamic loading via Module Federation runtime
 */

export interface MicroFrontendConfig {
  /** Unique identifier and URL path segment (e.g., 'store', 'checkout', 'account') */
  name: string;
  
  /** Display name for UI (e.g., 'Store', 'Checkout', 'Account') */
  displayName: string;
  
  /** Module Federation remote name (must match consumer's module-federation.config.ts) */
  remoteName: string;
  
  /** Exposed module path (standardized as 'ConsoleMicroApp', without './' prefix) */
  exposedModule: string;
  
  /** Base path for routing (e.g., '/store', '/checkout', '/account') */
  basePath: string;
  
  /** Remote entry URLs for different environments */
  urls: {
    dev: string;
    stg: string;
    prd: string;
  };
}

/**
 * Registry of all registered micro frontends
 * 
 * To add a new micro frontend:
 * 1. Create the micro frontend app with Module Federation
 * 2. Expose './ConsoleMicroApp' in its module-federation.config.ts
 * 3. Add an entry to this registry
 * 4. Deploy and access via /{name}/*
 */
/**
 * Get the base URL for remote micro-frontends
 * In production (Amplify), all remotes are under /remotes/
 * In development, they run on separate ports
 */
const getRemoteBaseUrl = (remoteName: string, env: 'dev' | 'stg' | 'prd'): string => {
  if (env === 'dev') {
    // Local development - each remote runs on its own port
    const ports: Record<string, number> = {
      store: 4201,
      checkout: 4202,
      account: 4203,
    };
    return `http://localhost:${ports[remoteName]}`;
  }

  // Production/Staging - all remotes are deployed together under /remotes/
  // Use window.location.origin to get the current domain dynamically
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/remotes/${remoteName}`;
};

const registry: MicroFrontendConfig[] = [
  {
    name: 'store',
    displayName: 'Store',
    remoteName: 'store',
    exposedModule: 'ConsoleMicroApp',
    basePath: '/store',
    urls: {
      dev: getRemoteBaseUrl('store', 'dev'),
      stg: getRemoteBaseUrl('store', 'stg'),
      prd: getRemoteBaseUrl('store', 'prd'),
    },
  },
  {
    name: 'checkout',
    displayName: 'Checkout',
    remoteName: 'checkout',
    exposedModule: 'ConsoleMicroApp',
    basePath: '/checkout',
    urls: {
      dev: getRemoteBaseUrl('checkout', 'dev'),
      stg: getRemoteBaseUrl('checkout', 'stg'),
      prd: getRemoteBaseUrl('checkout', 'prd'),
    },
  },
  {
    name: 'account',
    displayName: 'Account',
    remoteName: 'account',
    exposedModule: 'ConsoleMicroApp',
    basePath: '/account',
    urls: {
      dev: getRemoteBaseUrl('account', 'dev'),
      stg: getRemoteBaseUrl('account', 'stg'),
      prd: getRemoteBaseUrl('account', 'prd'),
    },
  },
];

/**
 * Get micro frontend configuration by app name
 * @param appName - The name of the micro frontend (e.g., 'store', 'checkout', 'account')
 * @returns The configuration object or undefined if not found
 */
export const getMicroFrontendConfig = (
  appName: string
): MicroFrontendConfig | undefined => {
  return registry.find((app) => app.name === appName);
};

/**
 * Get all registered micro frontends
 * @returns Array of all registered micro frontend configurations
 */
export const getAllRegisteredApps = (): MicroFrontendConfig[] => {
  return registry;
};

/**
 * Check if a micro frontend is registered
 * @param appName - The name of the micro frontend
 * @returns True if registered, false otherwise
 */
export const isRegistered = (appName: string): boolean => {
  return registry.some((app) => app.name === appName);
};

