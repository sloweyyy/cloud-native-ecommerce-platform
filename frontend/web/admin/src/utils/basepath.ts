/**
 * Checks if the app is running as a micro frontend (embedded in host app)
 * This is determined by checking if the app is loaded in a parent context
 * or if running in an iframe
 */
function isMicroFrontendApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if running in an iframe (common for micro frontends)
  if (window.parent !== window) {
    return true;
  }

  // Check for a global variable that might be set by the host app
  if ((window as unknown as { __MICRO_FRONTEND__?: boolean }).__MICRO_FRONTEND__) {
    return true;
  }

  return false;
}

/**
 * Gets the basepath for the application based on the mode
 * 
 * Best Practice for Micro Frontends:
 * - Standalone mode: Use '/' (empty string) as basepath so routes are accessible at root
 * - Micro frontend mode: Use '/admin' because the host app routes to '/admin/*' 
 *   and the micro frontend needs to match that basepath
 * 
 * @param appContextBasePath - Optional basepath from appContext (when running as micro frontend)
 * @returns The basepath string
 */
export function getBasepath(appContextBasePath?: string): string {
  // If basePath is explicitly provided from appContext (micro frontend mode), use it
  if (appContextBasePath) {
    return appContextBasePath;
  }

  // Detect mode and return appropriate basepath
  if (isMicroFrontendApp()) {
    // When embedded as micro frontend, use '/admin' to match host routing
    return '/admin';
  }

  // Standalone mode: use '/' (empty string) so routes are at root
  return '';
}

