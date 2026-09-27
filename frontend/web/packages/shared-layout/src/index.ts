// Main exports
export { Layout } from './components/Layout';
export type { LayoutProps } from './components/Layout';

export { Navbar } from './components/Navbar/Navbar';
export type { NavbarProps } from './components/Navbar/Navbar';

export { Footer } from './components/Footer';

export { CartPreview } from './components/CartPreview';
export type { CartItem } from './components/CartPreview';

export { LanguageSwitcher } from './components/LanguageSwitcher';

// Navigation utilities
export {
  configureNavigation,
  getNavigationConfig,
  isStandaloneMode,
  getStandaloneUrl,
  getHostUrl,
  checkHostAvailability,
  navigateWithFallback,
  createNavigationHandler,
} from './utils/navigation';

export { useNavigate, useNavigationHandler } from './utils/navigation-handler';

// Constants
export * from './constants/footer';
export * from './constants/navbar';
export * from './constants/theme';
export { themeConfig } from './constants/theme';
export type { ThemeConfig } from 'antd';
