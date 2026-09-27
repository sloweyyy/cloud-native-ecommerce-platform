import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MicroFrontendApp from './microFe/MicroFrontendApp';
import { ProtectedRoute } from './components/ProtectedRoute';

interface MicroFrontendRouteProps {
  appName: string;
  isProtected?: boolean;
}

/**
 * Micro-Frontend Route Wrapper
 *
 * Wraps micro-frontends with optional authentication protection.
 */
const MicroFrontendRoute: React.FC<MicroFrontendRouteProps> = ({ appName, isProtected }) => {
  if (isProtected) {
    return (
      <ProtectedRoute>
        <MicroFrontendApp appName={appName} />
      </ProtectedRoute>
    );
  }
  return <MicroFrontendApp appName={appName} />;
};

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ['checkout', 'account', 'admin'];

/**
 * Dynamic route element based on whether the route requires authentication
 * Used for the fallback `:appName/*` route
 */
const DynamicMicroFrontendRoute: React.FC = () => {
  // Get the current app name from the URL
  const appName = window.location.pathname.split('/')[1];

  // Check if this route requires authentication
  const isProtected = PROTECTED_ROUTES.includes(appName);

  return <MicroFrontendRoute appName={appName} isProtected={isProtected} />;
};

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Admin - protected route (auth required) - standalone without Layout
  {
    path: '/admin/*',
    element: <MicroFrontendRoute appName="admin" isProtected />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Store - public route (no auth required)
      {
        path: 'store/*',
        element: <MicroFrontendRoute appName="store" />,
      },
      // Checkout - protected route (auth required)
      {
        path: 'checkout/*',
        element: <MicroFrontendRoute appName="checkout" isProtected />,
      },
      // Account - protected route (auth required)
      {
        path: 'account/*',
        element: <MicroFrontendRoute appName="account" isProtected />,
      },
      // Fallback for other micro-frontends (dynamic check)
      {
        path: ':appName/*',
        element: <DynamicMicroFrontendRoute />,
      },
    ],
  },
];
