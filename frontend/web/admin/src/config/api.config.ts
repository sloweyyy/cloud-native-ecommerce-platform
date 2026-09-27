/**
 * Admin Module - API Configuration
 */

export const API_CONFIG = {
  ORDER: {
    BASE: '/Order',
    GET_ORDERS: (userName: string) => `/Order/GetOrdersByUserName/${userName}`,
    UPDATE_ORDER: '/Order/UpdateOrder',
    DELETE_ORDER: (id: number) => `/Order/${id}`,
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    UPDATE_SETTINGS: '/user/settings',
  },
  CATALOG: {
    BASE: '/Catalog',
    GET_ALL_PRODUCTS: '/Catalog/GetAllProducts',
    GET_PRODUCT_BY_ID: (id: string) => `/Catalog/GetProductById/${id}`,
    CREATE_PRODUCT: '/Catalog/CreateProduct',
    UPDATE_PRODUCT: '/Catalog/UpdateProduct',
    DELETE_PRODUCT: (id: string) => `/Catalog/${id}`,
    GET_ALL_BRANDS: '/Catalog/GetAllBrands',
    CREATE_BRAND: '/Catalog/CreateBrand',
    GET_ALL_TYPES: '/Catalog/GetAllTypes',
    CREATE_TYPE: '/Catalog/CreateType',
    UPLOAD_IMAGE: '/Catalog/UploadProductImage',
  },
  ACTIVITY: {
    BASE: '/Activity',
    GET_RECENT_ACTIVITIES: '/Activity',
  },
} as const;
