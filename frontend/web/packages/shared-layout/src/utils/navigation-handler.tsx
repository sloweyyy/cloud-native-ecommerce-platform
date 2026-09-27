/**
 * React hook and component for handling navigation with fallback logic
 */

import { useCallback } from 'react';
import { useNavigate as useReactRouterNavigate } from 'react-router-dom';
import {
  isStandaloneMode,
  navigateWithFallback,
  createNavigationHandler,
  getNavigationConfig,
} from './navigation';

/**
 * Custom navigation hook that handles redirects intelligently
 * 
 * In standalone mode:
 * - First tries to navigate to host app
 * - Falls back to standalone MFE if host is unavailable
 * 
 * In MFE mode (loaded by host):
 * - Uses normal React Router navigation
 * 
 * Note: This hook requires react-router-dom to be available.
 * For non-React Router contexts, use navigateWithFallback directly.
 */
export const useNavigate = (appName?: string) => {
  const reactRouterNavigate = useReactRouterNavigate();
  const isStandalone = isStandaloneMode();
  const config = getNavigationConfig();
  const currentAppName = appName || config.currentAppName;

  const navigate = useCallback(
    (path: string, options?: { forceStandalone?: boolean }) => {
      // If in standalone mode, use fallback navigation
      if (isStandalone) {
        navigateWithFallback(path, currentAppName, options?.forceStandalone || false);
        return;
      }

      // Otherwise, use React Router navigation (in host context)
      reactRouterNavigate(path);
    },
    [isStandalone, reactRouterNavigate, currentAppName]
  );

  return navigate;
};


/**
 * Create a navigation handler function
 */
export const useNavigationHandler = (appName?: string) => {
  return createNavigationHandler(appName);
};

