/**
 * Utility functions for app-injector
 */

// Declare require for TypeScript (available in webpack/bundler environments)
declare const require: {
  (id: string): unknown;
} | undefined;

/**
 * Checks if the current React version supports createRoot (React 18+)
 *
 * @returns true if createRoot is supported (React 18+), false otherwise (React 16/17)
 *
 * @example
 * ```ts
 * if (isSupportCreateRoot()) {
 *   // Use React 18+ createRoot API
 * } else {
 *   // Use legacy ReactDOM.render
 * }
 * ```
 */
export const isSupportCreateRoot = (): boolean => {
  try {
    // Try to dynamically import createRoot from react-dom/client
    // This module only exists in React 18+
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactDOMClient = typeof require !== 'undefined' 
      ? (require('react-dom/client') as { createRoot?: unknown } | null)
      : null;
    return typeof ReactDOMClient?.createRoot === 'function';
  } catch {
    // If the import fails, we're on React 16/17
    return false;
  }
};

/**
 * Delay utility - returns a promise that resolves after specified milliseconds
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wait for an element to be available in the DOM
 *
 * @param elementId - The ID of the element to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns Promise that resolves with the element or rejects on timeout
 */
export const waitForElement = (
  elementId: string,
  timeout = 5000
): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.getElementById(elementId);

      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(
          new Error(
            `Timeout waiting for element with id "${elementId}" to be available`
          )
        );
        return;
      }

      requestAnimationFrame(checkElement);
    };

    checkElement();
  });
};
