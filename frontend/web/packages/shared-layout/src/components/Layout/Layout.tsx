import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import type { NavbarProps } from '../Navbar/Navbar';

const { Content } = AntLayout;

export interface LayoutProps extends NavbarProps {
  /** Whether to hide navbar (default: false) */
  hideNavbar?: boolean;
  /** Whether to hide footer (default: false) */
  hideFooter?: boolean;
}

/**
 * AppLayout Component
 *
 * Main layout component that wraps all pages with Navbar and Footer
 * Supports both standalone and MFE modes with intelligent navigation
 */
const AppLayout: React.FC<LayoutProps> = ({
  hideNavbar = false,
  hideFooter = false,
  ...navbarProps
}) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <AntLayout
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!hideNavbar && !isLoginPage && <Navbar {...navbarProps} />}
      <Content
        style={{
          flex: 1,
          marginTop: hideNavbar || isLoginPage ? 0 : 176,
          minHeight: hideNavbar || isLoginPage ? '100vh' : 'calc(100vh - 176px)',
          background: '#ffffff',
          padding: hideNavbar || isLoginPage ? 0 : '32px 0',
        }}
      >
        <Outlet />
      </Content>
      {!hideFooter && !isLoginPage && <Footer appName={navbarProps.appName} />}
    </AntLayout>
  );
};

export default AppLayout;
export { AppLayout as Layout };

