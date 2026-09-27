import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { brandGradient } from '../../constants/theme';
import { useNavigate } from '../../utils/navigation-handler';

interface NavbarSearchProps {
  appName?: string;
}

function NavbarSearch({ appName }: NavbarSearchProps) {
  const navigate = useNavigate(appName);

  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      const encodedSearch = encodeURIComponent(searchValue.trim());
      navigate(`/store?search=${encodedSearch}`);
    }
  };

  return (
    <Input
      size="large"
      placeholder="Search for products, brands, and more..."
      prefix={<SearchOutlined />}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onPressEnter={handleSearch}
      aria-label="Search products"
      style={{
        borderRadius: 24,
        border: '2px solid #e2e8f0',
        background: '#f8fafc',
      }}
      suffix={
        <Button
          type="primary"
          onClick={handleSearch}
          style={{
            background: brandGradient.start,
            border: 'none',
            borderRadius: 18,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.3px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          }}
          aria-label="Submit search"
        >
          Search
        </Button>
      }
    />
  );
}

export default NavbarSearch;

