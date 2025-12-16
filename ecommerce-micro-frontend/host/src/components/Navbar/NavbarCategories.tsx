import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Button, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useCategories } from '../../services/categories';

function NavbarCategories() {
  const navigate = useNavigate();
  const { categories, isLoading } = useCategories();

  const menuItems: MenuProps['items'] = categories.map((cat) => ({
    key: cat.id,
    label: `${cat.icon} ${cat.name}`,
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
