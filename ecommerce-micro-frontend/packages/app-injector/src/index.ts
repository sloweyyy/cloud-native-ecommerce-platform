/**
 * @ecommerce-platform/app-injector
 *
 * Micro-frontend app injector for React applications.
 * Uses React 18+ createRoot API for rendering.
 *
 * @packageDocumentation
 */

// Main exports - Injector functions
export { createAppInjector } from './createAppInjector';
export { createEnhancedAppInjector } from './createEnhancedAppInjector';

// Utility exports
export { delay, waitForElement } from './utils';

// Environment utilities
export {
  isProductionEnv,
  isStagingEnv,
  isDevelopmentEnv,
  getEnvironment,
  getApiBaseUrl,
  configureEnvironment,
  getEnvironmentConfig,
  resetEnvironmentConfig,
  createEnvironmentDetector,
} from './env';

// Type exports
export type {
  // User and context types
  User,
  AppContext,
  MicroFrontendConfig,
  AppInjectorProps,
  // Injector types
  InjectorContainer,
  AppInjector,
  EnhancedAppInjector,
  InjectorOptions,
  // Environment types
  Environment,
  EnvironmentConfig,
} from './types';

