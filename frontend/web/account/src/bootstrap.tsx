/**
 * Account Module - Standalone Bootstrap
 *
 * Entry point for running the account module independently
 * with its own MSAL authentication.
 */

import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import App from './App';

// Create a query client for standalone mode
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Standalone App Wrapper
 *
 * Provides necessary context providers for standalone mode.
 */
const StandaloneApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#667eea',
              borderRadius: 8,
            },
          }}
        >
          <AntApp>
            {/* App runs without host config, triggering standalone MSAL mode */}
            <App />
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <StandaloneApp />
  </StrictMode>
);
