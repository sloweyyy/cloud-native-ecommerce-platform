import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
  auth?: {
    user: unknown;
    isAuthenticated: boolean;
    logout: () => void;
  };
  config?: {
    appContext?: Record<string, unknown>;
    onNavigate?: (path: string) => void;
    onError?: (error: Error) => void;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}

