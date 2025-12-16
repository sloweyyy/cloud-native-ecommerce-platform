import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type {
  AppInjectorProps,
  InjectorContainer,
  EnhancedAppInjector,
  InjectorOptions,
} from './types';
import { delay, waitForElement } from './utils';

/**
 * Creates an enhanced app injector with retry logic, async injection,
 * and better error handling.
 *
 * Uses React 18+ createRoot API for rendering.
 *
 * @param AppComponent - The React component to be injected
 * @param options - Configuration options for the injector
 * @returns An object with inject (async), unmount, and isInjected functions
 *
 * @example
 * ```tsx
 * import { createEnhancedAppInjector } from '@ecommerce-platform/app-injector';
 * import MyApp from './MyApp';
 *
 * const MyAppInjector = createEnhancedAppInjector(MyApp, {
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   debug: true,
 *   onSuccess: (id) => console.log(`Successfully injected into ${id}`),
 *   onFailure: (id, error) => console.error(`Failed to inject into ${id}`, error)
 * });
 *
 * // Inject asynchronously with retry
 * await MyAppInjector.inject('app-container', { config: { ... } });
 *
 * // Check if injected
 * if (MyAppInjector.isInjected('app-container')) {
 *   console.log('App is mounted');
 * }
 *
 * // Unmount when needed
 * MyAppInjector.unmount('app-container');
 * ```
 */
export function createEnhancedAppInjector<P extends AppInjectorProps = AppInjectorProps>(
  AppComponent: React.ComponentType<P>,
  options: InjectorOptions = {}
): EnhancedAppInjector {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    elementTimeout = 5000,
    debug = false,
    onSuccess,
    onFailure,
  } = options;

  const log = (...args: unknown[]): void => {
    if (debug) {
      console.log('[EnhancedAppInjector]', ...args);
    }
  };

  const logError = (...args: unknown[]): void => {
    console.error('[EnhancedAppInjector]', ...args);
  };

  /**
   * Inject component with retry logic
   */
  const inject = async (
    parentElementId: string,
    props: AppInjectorProps = {}
  ): Promise<void> => {
    log(`Starting injection into "${parentElementId}"`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log(`Attempt ${attempt}/${maxRetries} for "${parentElementId}"`);

        // Wait for element to be available
        const container = (await waitForElement(
          parentElementId,
          elementTimeout
        )) as InjectorContainer;

        if (!container) {
          throw new Error(
            `Container element with id "${parentElementId}" not found`
          );
        }

        const root: Root = createRoot(container);
        root.render(<AppComponent {...(props as P)} />);
        container.__root = root;

        log(`Successfully injected into "${parentElementId}"`);
        onSuccess?.(parentElementId);
        return;
      } catch (error) {
        lastError = error as Error;
        logError(
          `Attempt ${attempt}/${maxRetries} failed for "${parentElementId}":`,
          error
        );

        // Call config error handler if provided
        if (props.config?.onError) {
          props.config.onError(lastError);
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          log(`Waiting ${retryDelay}ms before retry...`);
          await delay(retryDelay);
        }
      }
    }

    // All retries failed
    const finalError =
      lastError ||
      new Error(
        `Failed to inject into "${parentElementId}" after ${maxRetries} attempts`
      );
    logError(
      `All injection attempts failed for "${parentElementId}"`,
      finalError
    );
    onFailure?.(parentElementId, finalError);

    throw finalError;
  };

  /**
   * Unmount component with error handling
   */
  const unmount = (parentElementId: string): void => {
    log(`Starting unmount from "${parentElementId}"`);

    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      logError(
        `Container element with id "${parentElementId}" not found during unmount`
      );
      return;
    }

    try {
      if (container.__root) {
        log('Unmounting using React 18+ root.unmount()');
        container.__root.unmount();
        delete container.__root;
      } else {
        log('No root instance found to unmount');
      }

      log(`Successfully unmounted from "${parentElementId}"`);
    } catch (error) {
      logError(`Error unmounting from "${parentElementId}":`, error);
    }
  };

  /**
   * Check if component is currently injected
   */
  const isInjected = (parentElementId: string): boolean => {
    const container = document.getElementById(
      parentElementId
    ) as InjectorContainer | null;

    if (!container) {
      return false;
    }

    return !!container.__root;
  };

  return {
    inject,
    unmount,
    isInjected,
  };
}

