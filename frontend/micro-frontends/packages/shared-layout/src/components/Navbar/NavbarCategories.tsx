import React from 'react';
import { Dropdown, Button, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from '../../utils/navigation-handler';

interface NavbarCategoriesProps {
  categories?: Array<{ id: string; name: string; icon?: string; path: string }>;
  isLoading?: boolean;
  appName?: string;
}

function NavbarCategories({ categories = [], isLoading = false, appName }: NavbarCategoriesProps) {
  const navigate = useNavigate(appName);

  const menuItems: MenuProps['items'] = categories.map((cat) => ({
    key: cat.id,
    label: `${cat.icon || ''} ${cat.name}`,
    onClick: () => navigate(cat.path),
  }));

  if (isLoading) {
    return (
      <Button type="primary" icon={<MenuOutlined />} disabled>
        <Spin size="small" />
      </Button>
    );
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomLeft"
      trigger={['click']}
    >
      <Button type="primary" icon={<MenuOutlined />}>
        All Categories
      </Button>
    </Dropdown>
  );
}

export default NavbarCategories;

