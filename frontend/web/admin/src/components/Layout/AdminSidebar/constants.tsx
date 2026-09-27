import {
  DashboardOutlined,
  SettingOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

export const MENU_ITEMS: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/products',
    icon: <ShoppingOutlined />,
    label: 'Products',
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: 'Orders',
  },
  {
    key: '/brands-types',
    icon: <SettingOutlined />,
    label: 'Brands & Types',
  },
];

