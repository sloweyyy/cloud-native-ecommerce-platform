import React, { useState, useMemo } from 'react';
import {
  Layout,
  Space,
  Typography,
  Avatar,
  Dropdown,
  theme,
  Flex,
  Input,
  Badge,
  Button,
} from 'antd';
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { layout } from '../../../config/theme';
import { USER_MENU_ITEMS } from './constants';

const { Header } = Layout;
const { Text } = Typography;

type AdminHeaderProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
};

/**
 * AdminHeader Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for header navigation and user actions
 */
function AdminHeader(props: AdminHeaderProps) {
  // 1. Props destructuring
  const { collapsed, onToggleSidebar } = props;

  // 2. State hooks
  const [searchValue, setSearchValue] = useState('');

  // 3. Other hooks
  const navigate = useNavigate();
  const routeContext = useRouteContext({ from: '__root__' });
  const { token } = theme.useToken();

  // 4. Derived state
  const auth = routeContext?.auth;
  const user = auth?.user as { displayName?: string; username?: string } | undefined;
  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.username) return user.username;
    return 'Admin User';
  }, [user]);

  // 5. Event handlers
  function handleLogout() {
    if (auth?.logout) {
      auth.logout();
    }
  }

  function handleUserMenuClick({ key }: { key: string }) {
    if (key === 'logout') {
      handleLogout();
    }
  }

  function handleSearch(value: string) {
    if (value.trim()) {
      navigate({ to: '/products', search: { search: value } });
    }
  }

  function toggleSidebar() {
    onToggleSidebar();
  }

  // 6. Main render
  return (
    <Header
      style={{
        padding: `0 ${token.sizeUnit * 4}px`,
        background: token.colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: token.boxShadowSecondary,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: layout.headerHeight,
      }}
    >
      <Flex align="center" gap={token.sizeUnit * 4} style={{ flex: 1 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{
            fontSize: token.fontSizeLG,
          }}
        />

        <Input.Search
          placeholder="Search products, orders, customers..."
          allowClear
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{
            maxWidth: 400,
            flex: 1,
          }}
          prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
          aria-label="Global search"
          enterButton
        />
      </Flex>

      <Flex align="center" gap={token.sizeUnit * 4}>
        <Badge count={0} showZero={false}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: token.fontSizeLG }} />}
            aria-label="Notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Badge>

        <Dropdown
          menu={{
            items: USER_MENU_ITEMS,
            onClick: handleUserMenuClick,
          }}
          placement="bottomRight"
        >
          <Space
            role="button"
            tabIndex={0}
            aria-label="User menu"
            aria-haspopup="true"
            style={{
              cursor: 'pointer',
              padding: `${token.sizeUnit * 2}px ${token.sizeUnit * 3}px`,
              borderRadius: token.borderRadius,
            }}
            className="user-menu-trigger"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
          >
            <Avatar
              icon={<UserOutlined />}
              style={{
                background: token.colorPrimary,
              }}
            />
            <Flex vertical gap={2} style={{ alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: token.fontSize }}>
                {displayName}
              </Text>
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Administrator
              </Text>
            </Flex>
          </Space>
        </Dropdown>
      </Flex>
    </Header>
  );
}

export default React.memo(AdminHeader);

