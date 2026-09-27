import React from 'react';
import {
  ShoppingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

export type IconType =
  | 'products'
  | 'orders'
  | 'revenue'
  | 'users'
  | 'Order'
  | 'Product';

type IconComponentProps = {
  style?: React.CSSProperties;
  className?: string;
};

const iconMap: Record<IconType, React.ComponentType<IconComponentProps>> = {
  products: ShoppingOutlined,
  orders: ShoppingCartOutlined,
  revenue: DollarOutlined,
  users: UserOutlined,
  Order: ShoppingCartOutlined,
  Product: FileTextOutlined,
};

export function getIcon(
  iconType: IconType | string
): React.ComponentType<IconComponentProps> {
  return iconMap[iconType as IconType] || FileTextOutlined;
}

