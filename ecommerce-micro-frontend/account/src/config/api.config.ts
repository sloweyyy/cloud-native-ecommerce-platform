/**
 * Account Module - API Configuration
 */

export const API_CONFIG = {
  ORDER: {
    BASE: '/Order',
    GET_ORDERS: (userName: string) => `/Order/GetOrdersByUserName/${userName}`,
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    UPDATE_SETTINGS: '/user/settings',
  },
} as const;

