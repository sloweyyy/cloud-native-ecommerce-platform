# @ecommerce-platform/auth-provider

A reusable React authentication provider for ecommerce micro-frontend applications with MSAL (Azure AD B2C) support.

## Installation

```bash
npm install @ecommerce-platform/auth-provider
```

## Features

- 🔐 MSAL (Azure AD B2C) integration
- 🔄 Token broadcast for micro-frontend synchronization
- 🛠️ Debug mode with preset tokens for development
- ⚛️ React Query integration
- 🎣 Convenient auth hooks

## Usage

### Basic Usage (Host Application)

```tsx
import { EcommerceAuthProvider, useAuth } from '@ecommerce-platform/auth-provider';

const msalConfig = {
  clientId: 'your-client-id',
  authority: 'https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signupsignin',
  knownAuthorities: ['your-tenant.b2clogin.com'],
};

function App() {
  return (
    <EcommerceAuthProvider msalConfig={msalConfig}>
      <YourApp />
    </EcommerceAuthProvider>
  );
}
```

### Using the Auth Hook

```tsx
import { useAuth } from '@ecommerce-platform/auth-provider';

function UserProfile() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }

  return (
    <div>
      <p>Hello, {user?.displayName}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Debug Mode (Development)

For local development without MSAL:

```tsx
<EcommerceAuthProvider
  msalConfig={msalConfig}
  debug={{
    logging: true,
    presetToken: 'dev-token-123',
    presetUser: {
      id: 'dev-user-1',
      email: 'dev@example.com',
      displayName: 'Dev User',
    },
  }}
>
  <App />
</EcommerceAuthProvider>
```

### Using with Existing MSAL/QueryClient Setup

If your application already has MSAL and QueryClient providers:

```tsx
import { MsalProvider } from '@azure/msal-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { InternalAuthProvider } from '@ecommerce-platform/auth-provider';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MsalProvider instance={msalInstance}>
        <InternalAuthProvider>
          <YourApp />
        </InternalAuthProvider>
      </MsalProvider>
    </QueryClientProvider>
  );
}
```

## API Reference

### Components

#### `EcommerceAuthProvider`

Main authentication provider that includes MSAL, QueryClient, and auth context.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `msalConfig` | `MsalConfigOptions` | Yes | MSAL configuration options |
| `debug` | `DebugOptions` | No | Debug options for development |
| `children` | `ReactNode` | Yes | Child components |

#### `InternalAuthProvider`

Internal provider without MSAL/QueryClient wrappers. Use when you have existing providers.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `debug` | `DebugOptions` | No | Debug options for development |
| `children` | `ReactNode` | Yes | Child components |

### Hooks

#### `useAuth()`

Main hook to access authentication context.

```tsx
const {
  user,           // AuthUser | null
  isAuthenticated,// boolean
  isLoading,      // boolean
  accessToken,    // string | null
  error,          // Error | null
  login,          // () => Promise<void>
  logout,         // () => Promise<void>
  getAccessToken, // () => Promise<string | null>
  isTokenExpired, // () => boolean
  isDebugMode,    // boolean
} = useAuth();
```

#### Additional Hooks

- `useLogin()` - Login functionality
- `useLogout()` - Logout functionality
- `useAccessToken()` - Get access token
- `useIsAuthenticated()` - Check authentication status
- `useCurrentUser()` - Get current user
- `useAuthLoading()` - Get loading state
- `useUserDisplayName()` - Get user display name
- `useUserEmail()` - Get user email

### Types

#### `MsalConfigOptions`

```typescript
interface MsalConfigOptions {
  clientId: string;
  authority: string;
  knownAuthorities?: string[];
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scopes?: string[];
}
```

#### `DebugOptions`

```typescript
interface DebugOptions {
  logging?: boolean;
  presetToken?: string;
  presetUser?: Partial<AuthUser>;
  env?: 'development' | 'staging' | 'production';
}
```

#### `AuthUser`

```typescript
interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  accountInfo?: AccountInfo;
  claims?: Record<string, unknown>;
}
```

## Token Broadcasting

The package includes token broadcasting for micro-frontend synchronization:

```tsx
// In host app - broadcast token updates
import { broadcastToken } from '@ecommerce-platform/auth-provider';

broadcastToken(accessToken, tokenExpiry);

// In remote modules - subscribe to broadcasts
import { useTokenBroadcastSubscription } from '@ecommerce-platform/auth-provider';

function RemoteModule() {
  const { token, tokenExpiry } = useTokenBroadcastSubscription();
  // Token updates automatically received from host
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode
npm run build:watch

# Type check
npm run typecheck
```

## Publishing

```bash
# Build and publish
npm run clean && npm run build
npm publish --access public

# Version management
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## License

MIT

