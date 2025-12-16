/**
 * Protected Route Component
 *
 * Guards routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@ecommerce-platform/auth-provider';

interface ProtectedRouteProps {
  /** Child components to render if authenticated */
  children: React.ReactNode;
  /** Path to redirect to if not authenticated */
  redirectTo?: string;
  /** Whether to show loading state while checking auth */
  showLoading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Required roles for access (optional) */
  requiredRoles?: string[];
}

/**
 * Default loading component
 */
const DefaultLoading: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 16,
    }}
  >
    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    <span style={{ color: '#666' }}>Checking authentication...</span>
  </div>
);

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication. Shows loading state while
 * checking auth, redirects to login if not authenticated.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  showLoading = true,
  loadingComponent,
  requiredRoles,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, error, login } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    if (!showLoading) {
      return null;
    }
    return <>{loadingComponent || <DefaultLoading />}</>;
  }

  // Show error state if auth failed
  if (error) {
    return (
      <Result
        status="error"
        title="Authentication Error"
        subTitle={error.message || 'An error occurred during authentication'}
        extra={[
          <Button type="primary" key="retry" onClick={() => login()}>
            Try Again
          </Button>,
          <Button key="home" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>,
        ]}
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.claims?.role as string | undefined;
    const hasRequiredRole = userRole && requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      return (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this page"
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      );
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
