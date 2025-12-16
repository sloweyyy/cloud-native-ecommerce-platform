import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { AppInjectorProps, InjectorContainer, AppInjector } from './types';

/**
 * Creates a higher-order function that provides standardized inject and unmount methods
 * for any React component to be used in a micro-frontend architecture.
 *
 * Uses React 18+ createRoot API for rendering.
 *
 * @param AppComponent - The React component to be injected
 * @returns An object with inject and unmount functions
 *
 * @example
 * ```tsx
 * import { createAppInjector } from '@ecommerce-platform/app-injector';
 * import MyApp from './MyApp';
 *
 * const MyAppInjector = createAppInjector(MyApp);
 *
 * // Inject the component
 * MyAppInjector.inject('app-container', {
 *   config: {
 *     appContext: { user: currentUser },
 *     onNavigate: handleNavigate
 *   }
 * });
 *
 * // Unmount when needed
 * MyAppInjector.unmount('app-container');
 * ```
 */
export function createAppInjector<
  P extends AppInjectorProps = AppInjectorProps
>(AppComponent: React.ComponentType<P>): AppInjector {
  /**
   * Injects the component into the specified parent element
   *
   * @param parentElementId - The ID of the parent element to inject into
   * @param props - Props to pass to the component including config
   */
  const inject = (
    parentElementId: string,
    props: AppInjectorProps = {}
  ): void => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      console.error(
        `[AppInjector] Container element with id "${parentElementId}" not found`
      );
      return;
    }

    try {
      const root: Root = createRoot(container);
      root.render(<AppComponent {...(props as P)} />);

      // Store the root instance on the container to be able to unmount it later
      container.__root = root;
    } catch (error) {
      console.error('[AppInjector] Error injecting component:', error);
      if (props.config?.onError) {
        props.config.onError(error as Error);
      }
    }
  };

  /**
   * Unmounts the component from the specified parent element
   *
   * @param parentElementId - The ID of the parent element to unmount from
   */
  const unmount = (parentElementId: string): void => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      console.error(
        `[AppInjector] Container element with id "${parentElementId}" not found`
      );
      return;
    }

    try {
      if (container.__root) {
        container.__root.unmount();
        delete container.__root;
      }
    } catch (error) {
      console.error('[AppInjector] Error unmounting component:', error);
    }
  };

  return {
    inject,
    unmount,
  };
}
