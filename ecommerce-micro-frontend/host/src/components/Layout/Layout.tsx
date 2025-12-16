import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const { Content } = AntLayout;

/**
 * AppLayout Component
 *
 * Main layout component that wraps all pages with TopBar, Navbar and Footer
 */
const AppLayout: React.FC = () => {
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
      {!isLoginPage && <Navbar />}
      <Content
        style={{
          flex: 1,
          marginTop: isLoginPage ? 0 : 176,
          minHeight: isLoginPage ? '100vh' : 'calc(100vh - 176px)',
          background: '#ffffff',
          padding: isLoginPage ? 0 : '32px 0',
        }}
      >
        <Outlet />
      </Content>
      {!isLoginPage && <Footer />}
    </AntLayout>
  );
};

export default AppLayout;
