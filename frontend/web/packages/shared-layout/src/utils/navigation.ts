/**
 * Navigation utilities for handling redirects between host and standalone MFE apps
 */

export interface MFEConfig {
  /** Host app URL (default: http://localhost:4200) */
  hostUrl?: string;
  /** Map of MFE app names to their standalone ports */
  standalonePorts?: Record<string, number>;
  /** Current MFE app name (e.g., 'store', 'checkout', 'account') */
  currentAppName?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<MFEConfig> = {
  hostUrl: 'http://localhost:4200',
  standalonePorts: {
    store: 4201,
    checkout: 4202,
    account: 4203,
    admin: 4204,
  },
  currentAppName: '',
};

let config: Required<MFEConfig> = { ...DEFAULT_CONFIG };

/**
 * Configure navigation settings
 */
export const configureNavigation = (newConfig: Partial<MFEConfig>): void => {
  config = {
    ...config,
    ...newConfig,
    standalonePorts: {
      ...config.standalonePorts,
      ...newConfig.standalonePorts,
    },
  };
};

/**
 * Get current configuration
 */
export const getNavigationConfig = (): Required<MFEConfig> => {
  return { ...config };
};

/**
 * Type declaration for window.__MFE_HOST__
 */
declare global {
  interface Window {
    __MFE_HOST__?: boolean;
  }
}

/**
 * Check if running in standalone mode
 * Standalone mode is detected when:
 * 1. window.__MFE_HOST__ is not defined (not loaded by host)
 * 2. Current port matches a standalone MFE port
 */
export const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check if loaded by host (host sets this flag)
  if (window.__MFE_HOST__) {
    return false;
  }

  // Check if current port matches a standalone MFE port
  const currentPort = window.location.port
    ? parseInt(window.location.port, 10)
    : window.location.protocol === 'https:'
      ? 443
      : 80;

  return Object.values(config.standalonePorts).includes(currentPort);
};

/**
 * Get the standalone URL for a specific MFE app
 */
export const getStandaloneUrl = (appName: string, path: string = '/'): string => {
  const port = config.standalonePorts[appName];
  if (!port) {
    console.warn(`[shared-layout] No standalone port configured for app: ${appName}`);
    return path;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:${port}${path}`;
};

/**
 * Get the host URL for a specific path
 */
export const getHostUrl = (path: string = '/'): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = new URL(config.hostUrl).port || (protocol === 'https:' ? '443' : '80');
  
  // In production, hostUrl might be a full domain
  if (config.hostUrl.startsWith('http')) {
    const hostUrlObj = new URL(config.hostUrl);
    return `${hostUrlObj.protocol}//${hostUrlObj.host}${path}`;
  }
  
  return `${protocol}//${hostname}:${port}${path}`;
};

/**
 * Check if host is accessible
 * Attempts to fetch the host URL to verify it's available
 */
export const checkHostAvailability = async (timeout: number = 2000): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    const hostUrl = getHostUrl('/');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    await fetch(hostUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    // Host is not accessible
    return false;
  }
};

/**
 * Navigate to a path, trying host first, then falling back to standalone MFE
 * 
 * @param path - The path to navigate to (e.g., '/checkout', '/store')
 * @param appName - Optional app name to redirect to if host is unavailable
 * @param forceStandalone - Force navigation to standalone app without checking host
 */
export const navigateWithFallback = async (
  path: string,
  appName?: string,
  forceStandalone: boolean = false
): Promise<void> => {
  if (typeof window === 'undefined') return;

  const isStandalone = isStandaloneMode();

  // If already in host context, just navigate normally
  if (!isStandalone && !forceStandalone) {
    window.location.href = path;
    return;
  }

  // In standalone mode, try host first
  if (!forceStandalone) {
    const hostAvailable = await checkHostAvailability();
    if (hostAvailable) {
      const hostUrl = getHostUrl(path);
      window.location.href = hostUrl;
      return;
    }
  }

  // Host is not available, redirect to standalone MFE
  if (appName) {
    const standaloneUrl = getStandaloneUrl(appName, path);
    window.location.href = standaloneUrl;
  } else {
    // No app name provided, try to extract from path
    const pathParts = path.split('/').filter(Boolean);
    const extractedAppName = pathParts[0];
    if (extractedAppName && config.standalonePorts[extractedAppName]) {
      const standaloneUrl = getStandaloneUrl(extractedAppName, path);
      window.location.href = standaloneUrl;
    } else {
      // Fallback: navigate to host anyway (might work in production)
      window.location.href = getHostUrl(path);
    }
  }
};

/**
 * Create a navigation handler that uses the fallback logic
 */
export const createNavigationHandler = (appName?: string) => {
  return (path: string, forceStandalone: boolean = false) => {
    navigateWithFallback(path, appName, forceStandalone);
  };
};

