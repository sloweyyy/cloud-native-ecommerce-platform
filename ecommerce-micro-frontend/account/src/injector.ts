import { createAppInjector, AppInjectorProps } from '@ecommerce-platform/app-injector';
import AccountModule from './app/Module';

/**
 * Account App Injector
 *
 * This creates standardized inject/unmount methods for the Account micro-frontend.
 * Used by the host application to dynamically load and unload this remote app.
 */
const AccountAppInjector = createAppInjector(AccountModule);

/**
 * Inject the Account app into a DOM element
 *
 * @param elementId - The ID of the DOM element to inject into
 * @param props - Configuration and props to pass to the Account app
 *
 * @example
 * ```typescript
 * inject('account-container', {
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
  AccountAppInjector.inject(elementId, props);
};

/**
 * Unmount the Account app from a DOM element
 *
 * @param elementId - The ID of the DOM element to unmount from
 *
 * @example
 * ```typescript
 * unmount('account-container');
 * ```
 */
export const unmount = (elementId: string) => {
  AccountAppInjector.unmount(elementId);
};

// Default export for Module Federation
export default {
  inject,
  unmount,
};
