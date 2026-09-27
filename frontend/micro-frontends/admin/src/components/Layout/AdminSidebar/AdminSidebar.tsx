import React from 'react';
import { Layout, Menu, Space, Typography, theme } from 'antd';
import { useLocation } from '@tanstack/react-router';
import { layout } from '../../../config/theme';
import { MENU_ITEMS } from './constants';

const { Sider } = Layout;
const { Text } = Typography;

type AdminSidebarProps = {
  collapsed: boolean;
  onMenuClick: (key: string) => void;
};

/**
 * AdminSidebar Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for sidebar navigation and branding
 * - OCP: Open for extension via menu items configuration
 */
function AdminSidebar(props: AdminSidebarProps) {
  // 1. Props destructuring
  const { collapsed, onMenuClick } = props;

  // 2. Other hooks
  const location = useLocation();
  const { token } = theme.useToken();

  // 3. Event handlers
  function handleMenuClick({ key }: { key: string }) {
    onMenuClick(key);
  }

  // 4. Main render
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={layout.sidebarWidth}
      collapsedWidth={layout.sidebarCollapsedWidth}
      style={{
        background: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <Space
        direction="vertical"
        align="center"
        style={{
          width: '100%',
          padding: collapsed ? '24px 16px' : '32px 24px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          marginBottom: token.sizeUnit * 2,
        }}
      >
        {!collapsed && (
          <Space direction="vertical" size={6} align="center" style={{ width: '100%' }}>
            <Text
              strong
              style={{
                color: token.colorText,
                fontSize: token.fontSizeHeading3,
                fontWeight: 700,
                marginBottom: 0,
                letterSpacing: '0.3px',
              }}
            >
              Admin Panel
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                marginBottom: 0,
              }}
            >
              E-commerce Platform
            </Text>
          </Space>
        )}
        {collapsed && (
          <Space
            style={{
              width: 48,
              height: 48,
              borderRadius: token.borderRadius,
              background: token.colorPrimaryBg,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              strong
              style={{
                color: token.colorPrimary,
                fontSize: token.fontSizeHeading4,
                fontWeight: 700,
                marginBottom: 0,
              }}
            >
              A
            </Text>
          </Space>
        )}
      </Space>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        items={MENU_ITEMS}
        style={{
          borderRight: 0,
          marginTop: token.sizeUnit * 2,
          padding: `0 ${token.sizeUnit * 3}px`,
          background: 'transparent',
        }}
        role="navigation"
        aria-label="Main navigation"
      />
    </Sider>
  );
}

export default React.memo(AdminSidebar);

