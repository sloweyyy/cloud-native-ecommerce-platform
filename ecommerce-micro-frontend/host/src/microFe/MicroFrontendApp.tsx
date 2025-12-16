/**
 * Generic Micro Frontend Loader
 *
 * Dynamically loads and renders micro frontends based on route parameters.
 * Uses Module Federation runtime to load remote modules at runtime.
 *
 * Architecture:
 * - Host doesn't know about specific micro frontends
 * - Reads app name from route params (/:appName/*)
 * - Looks up config from registry
 * - Dynamically loads remote module
 * - Injects into DOM container
 *
 * Pattern adapted from console-ui WebKitMicroApp implementation.
 */

import { init, loadRemote } from '@module-federation/enhanced/runtime';
import { Spin } from 'antd';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMicroFrontendConfig } from '../config/microFrontendRegistry';
import { getRemoteUrl } from '../helpers/environment';
import { ErrorBoundary, ErrorBoundaryFallback } from './ErrorBoundary';
import { useAppConfig } from '../context/AppConfigContext';

interface RemoteModule {
  inject: (elementId: string, props?: unknown) => void;
  unmount: (elementId: string) => void;
}

/**
 * Micro Frontend Content Component
 * Handles the actual loading and injection of the remote module
 */
const MicroFrontendContent: React.FC<{ appName: string }> = ({ appName }) => {
  const { config: appConfig } = useAppConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerIdRef = useRef(`mfe-${appName}-${Date.now()}`);
  const unmountFnRef = useRef<((elementId: string) => void) | null>(null);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  const microFrontendConfig = getMicroFrontendConfig(appName);

  // Get initial search params from browser URL
  const getInitialSearchParams = useCallback(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Callback for micro-frontend to update browser URL
  const handleSearchChange = useCallback(
    (newSearch: Record<string, unknown>) => {
      const newParams = new URLSearchParams();
      Object.entries(newSearch).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          newParams.set(key, String(value));
        }
      });
      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!microFrontendConfig) {
      setError(
        new Error(
          `Micro frontend "${appName}" is not registered in the registry.`
        )
      );
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadMicroFrontend = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get remote URL for current environment
        const remoteUrl = getRemoteUrl(microFrontendConfig.urls);

        console.log(`[MicroFrontendApp] Loading ${appName} from ${remoteUrl}`);

        // Initialize Module Federation runtime
        init({
          name: '@ecommerce-host',
          remotes: [
            {
              name: microFrontendConfig.remoteName,
              entry: `${remoteUrl}/remoteEntry.js`,
            },
          ],
        });

        // Load the remote module
        // Format: remoteName/exposedModule (e.g., 'store/ConsoleMicroApp')
        const remoteModule = await loadRemote<{ default: RemoteModule }>(
          `${microFrontendConfig.remoteName}/${microFrontendConfig.exposedModule}`
        );

        if (!isMounted) return;

        if (!remoteModule || !remoteModule.default) {
          throw new Error(
            `Remote module "${microFrontendConfig.exposedModule}" not found in "${microFrontendConfig.remoteName}"`
          );
        }

        const { inject, unmount } = remoteModule.default;

        if (!inject || typeof inject !== 'function') {
          throw new Error(`Remote module does not export an "inject" function`);
        }

        // Store unmount function for cleanup
        unmountFnRef.current = unmount;

        // Wait for container to be rendered before injecting
        // Use a small delay to ensure DOM is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify container exists
        const containerElement = document.getElementById(
          containerIdRef.current
        );
        if (!containerElement) {
          throw new Error(
            `Container element with id "${containerIdRef.current}" not found`
          );
        }

        // Inject the micro frontend into the container
        // Pass basePath and URL sync callbacks
        inject(containerIdRef.current, {
          config: {
            ...appConfig,
            appContext: {
              ...appConfig?.appContext,
              basePath: `/${appName}`,
              initialSearchParams: getInitialSearchParams(),
              onSearchChange: handleSearchChange,
            },
          },
        });

        console.log(`[MicroFrontendApp] Successfully loaded ${appName}`);
        setIsLoading(false);
      } catch (err) {
        console.error(`[MicroFrontendApp] Error loading ${appName}:`, err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error('Failed to load micro frontend')
          );
          setIsLoading(false);
        }
      }
    };

    loadMicroFrontend();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (unmountFnRef.current) {
        try {
          unmountFnRef.current(containerIdRef.current);
          console.log(`[MicroFrontendApp] Unmounted ${appName}`);
        } catch (err) {
          console.error(`[MicroFrontendApp] Error unmounting ${appName}:`, err);
        }
      }
    };
  }, [appName, microFrontendConfig, appConfig, getInitialSearchParams, handleSearchChange]);

  // Show error state
  if (error) {
    return (
      <ErrorBoundaryFallback
        error={error}
        onReset={() => {
          setError(null);
          setIsLoading(true);
        }}
      />
    );
  }

  // Render the container where micro frontend will be injected
  // Show loading spinner as overlay while loading
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        minHeight: '400px',
        position: 'relative',
      }}
    >
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1000,
          }}
        >
          <Spin
            size="large"
            tip={`Loading ${microFrontendConfig?.displayName || appName}...`}
          />
        </div>
      )}
      <div
        ref={containerElementRef}
        id={containerIdRef.current}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  );
};

interface MicroFrontendAppProps {
  /** Optional app name override - if not provided, reads from URL params */
  appName?: string;
}

/**
 * Main Micro Frontend App Component
 *
 * Entry point for all micro frontend routes.
 * Reads app name from URL or props and delegates to MicroFrontendContent.
 */
const MicroFrontendApp: React.FC<MicroFrontendAppProps> = (props) => {
  const { appName: urlAppName } = useParams<{ appName: string }>();
  const navigate = useNavigate();

  // Use prop if provided, otherwise fall back to URL param
  const appName = props.appName || urlAppName;

  // Validate app name
  if (!appName) {
    console.error('[MicroFrontendApp] No app name provided in route');
    navigate('/');
    return null;
  }

  const microFrontendConfig = getMicroFrontendConfig(appName);

  // Validate app is registered
  if (!microFrontendConfig) {
    console.error(
      `[MicroFrontendApp] Micro frontend "${appName}" not found in registry`
    );

    return (
      <ErrorBoundaryFallback
        error={
          new Error(
            `Micro frontend "${appName}" is not available. Please check the URL or contact support.`
          )
        }
        onReset={() => navigate('/')}
      />
    );
  }

  return (
    <ErrorBoundary>
      <MicroFrontendContent appName={appName} />
    </ErrorBoundary>
  );
};

export default MicroFrontendApp;
