import { createAppInjector, AppInjectorProps } from '@ecommerce-platform/app-injector';
import StoreModule from './app/Module';
import { setupMocks } from './services/mocks';
import { env } from './config';

// Setup mock adapter only if enabled in environment
// This runs when the module is first loaded as a micro-frontend
if (env.useMockData) {
  setupMocks();
}

/**
 * Store App Injector
 *
 * This creates standardized inject/unmount methods for the Store micro-frontend.
 * Used by the host application to dynamically load and unload this remote app.
 */
const StoreAppInjector = createAppInjector(StoreModule);

/**
 * Inject the Store app into a DOM element
 *
 * @param elementId - The ID of the DOM element to inject into
 * @param props - Configuration and props to pass to the Store app
 *
 * @example
 * ```typescript
 * inject('store-container', {
 *   config: {
 *     appContext: {
 *       user: currentUser,
 *       token: authToken,
 *       theme: 'light'
 *     },
 *     onNavigate: (path) => navigate(path),
 *     onError: (error) => console.error(error)
 *   }
 * });
 * ```
 */
export const inject = (elementId: string, props?: AppInjectorProps) => {
  StoreAppInjector.inject(elementId, props);
};

/**
 * Unmount the Store app from a DOM element
 *
 * @param elementId - The ID of the DOM element to unmount from
 *
 * @example
 * ```typescript
 * unmount('store-container');
 * ```
 */
export const unmount = (elementId: string) => {
  StoreAppInjector.unmount(elementId);
};

// Default export for Module Federation
export default {
  inject,
  unmount,
};
