import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export const USER_MENU_ITEMS: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
  {
    type: 'divider' as const,
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    danger: true,
  },
];

