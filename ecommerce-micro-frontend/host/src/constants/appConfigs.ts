export const APP_NAME = 'NextTech';
export const APP_VERSION = '1.0.0';

export const ENV = process.env['NODE_ENV'] || 'development';
export const IS_DEV = ENV === 'development';
export const IS_PROD = ENV === 'production';

export const API_BASE_URL =
  process.env['NX_API_BASE_URL'] || 'http://localhost:3001/api';

// Remote apps configuration
export const REMOTE_APPS = {
  STORE: {
    name: 'store',
    basePath: '/store',
    displayName: 'Store',
  },
  CHECKOUT: {
    name: 'checkout',
    basePath: '/checkout',
    displayName: 'Checkout',
  },
  ACCOUNT: {
    name: 'account',
    basePath: '/account',
    displayName: 'Account',
  },
} as const;
