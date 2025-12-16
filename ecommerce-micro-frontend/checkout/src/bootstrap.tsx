import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import Module from './app/Module';
import { queryClient } from './services/queryClient';
import { setupMocks } from './services/mocks';

setupMocks();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Module />
    </QueryClientProvider>
  </StrictMode>
);
