import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { layout } from '../../config/theme';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBreadcrumb } from './AdminBreadcrumb';

const { Content } = Layout;

/**
 * AdminLayout Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for layout composition
 * - OCP: Open for extension via sub-components
 */
function AdminLayout() {
  // 1. State hooks
  const [collapsed, setCollapsed] = useState(false);

  // 2. Other hooks
  const { token } = theme.useToken();
  const navigate = useNavigate();

  // 3. Event handlers
  function handleMenuClick(key: string) {
    navigate({ to: key });
  }

  function toggleSidebar() {
    setCollapsed(!collapsed);
  }

  // 4. Main render
  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <AdminSidebar collapsed={collapsed} onMenuClick={handleMenuClick} />
      <Layout
        style={{
          marginLeft: collapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth,
          transition: 'margin-left 0.2s',
        }}
      >
        <AdminHeader collapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <Content
          style={{
            padding: `${token.sizeUnit * 4}px ${token.sizeUnit * 6}px`,
            minHeight: `calc(100vh - ${layout.headerHeight}px)`,
            background: token.colorBgLayout,
          }}
        >
          <AdminBreadcrumb />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default React.memo(AdminLayout);
