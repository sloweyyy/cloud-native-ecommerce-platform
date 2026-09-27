import { createAppInjector, AppInjectorProps } from '@ecommerce-platform/app-injector';
import App from './App';

/**
 * Admin App Injector
 *
 * This creates standardized inject/unmount methods for the Admin micro-frontend.
 * Used by the host application to dynamically load and unload this remote app.
 */
const AdminAppInjector = createAppInjector(App);

/**
 * Inject the Admin app into a DOM element
 *
 * @param elementId - The ID of the DOM element to inject into
 * @param props - Configuration and props to pass to the Admin app
 *
 * @example
 * ```typescript
 * inject('admin-container', {
 *   config: {
 *     appContext: {
 *       user: currentUser,
 *       token: authToken,
 *       theme: 'light'
 *     },
 *     onNavigate: (path) => navigate(path),
 *     onLogout: () => handleLogout(),
 *     onError: (error) => console.error(error)
 *   }
 * });
 * ```
 */
export const inject = (elementId: string, props?: AppInjectorProps) => {
  AdminAppInjector.inject(elementId, props);
};

/**
 * Unmount the Admin app from a DOM element
 *
 * @param elementId - The ID of the DOM element to unmount from
 *
 * @example
 * ```typescript
 * unmount('admin-container');
 * ```
 */
export const unmount = (elementId: string) => {
  AdminAppInjector.unmount(elementId);
};

// Default export for Module Federation
export default {
  inject,
  unmount,
};

