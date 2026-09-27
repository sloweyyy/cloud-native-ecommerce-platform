/**
 * User information interface for authenticated users
 */
export interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'guest' | string;
  [key: string]: unknown;
}

/**
 * Application context passed to micro-frontends
 */
export interface AppContext {
  /** Current authenticated user */
  user?: User | null;
  /** Authentication token */
  token?: string | null;
  /** Theme preference */
  theme?: 'light' | 'dark' | string;
  /** Locale/language code */
  locale?: string;
  /** Base path for the micro-frontend */
  basePath?: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Allow additional properties */
  [key: string]: unknown;
}

/**
 * Configuration object for micro-frontend apps
 */
export interface MicroFrontendConfig {
  /** Application context with user info, theme, etc. */
  appContext?: AppContext;
  /** Navigation callback for cross-MFE navigation */
  onNavigate?: (path: string) => void;
  /** Logout callback */
  onLogout?: () => void;
  /** Error handler callback */
  onError?: (error: Error) => void;
  /** Allow additional properties */
  [key: string]: unknown;
}

/**
 * Props passed to injected app components
 */
export interface AppInjectorProps {
  /** Micro-frontend configuration */
  config?: MicroFrontendConfig;
  /** Allow additional properties */
  [key: string]: unknown;
}

/**
 * Container element with React root instance
 * Used internally to track React 18+ root instances
 */
export interface InjectorContainer extends HTMLElement {
  /** React 18+ Root instance (internal use) */
  __root?: import('react-dom/client').Root;
}

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * App injector interface - basic version
 */
export interface AppInjector {
  /** Inject the component into the specified container element */
  inject: (parentElementId: string, props?: AppInjectorProps) => void;
  /** Unmount the component from the specified container element */
  unmount: (parentElementId: string) => void;
}

/**
 * Enhanced app injector interface with async inject and status checking
 */
export interface EnhancedAppInjector {
  /** Inject the component with retry logic (async) */
  inject: (parentElementId: string, props?: AppInjectorProps) => Promise<void>;
  /** Unmount the component from the specified container element */
  unmount: (parentElementId: string) => void;
  /** Check if a component is currently injected in the container */
  isInjected: (parentElementId: string) => boolean;
}

/**
 * Options for enhanced app injector
 */
export interface InjectorOptions {
  /**
   * Number of retries on injection failure
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Timeout for waiting for container element in milliseconds
   * @default 5000
   */
  elementTimeout?: number;

  /**
   * Enable detailed logging
   * @default false
   */
  debug?: boolean;

  /**
   * Callback when injection succeeds
   */
  onSuccess?: (elementId: string) => void;

  /**
   * Callback when injection fails after all retries
   */
  onFailure?: (elementId: string, error: Error) => void;
}

/**
 * Environment detection configuration
 */
export interface EnvironmentConfig {
  /** Production hostname */
  productionHostname: string;
  /** Staging hostname */
  stagingHostname: string;
  /** Development hostnames (can include localhost patterns) */
  developmentHostnames: string[];
  /** API URLs per environment */
  apiUrls: {
    production: string;
    staging: string;
    development: string;
  };
}

