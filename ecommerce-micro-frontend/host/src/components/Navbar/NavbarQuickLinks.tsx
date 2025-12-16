import { useNavigate, useLocation } from 'react-router-dom';
import { Space, Button } from 'antd';

interface QuickLink {
  path: string;
  label: string;
  special?: boolean;
}

const QUICK_LINKS: QuickLink[] = [
  { path: '/', label: 'Home' },
  { path: '/store', label: 'Store' },
  { path: '/deals', label: 'Flash Sale' },
  { path: '/deals', label: "Today's Deals" },
  { path: '/new-arrivals', label: 'New Arrivals' },
];

function NavbarQuickLinks() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Space size="small" style={{ flex: 1 }}>
      {QUICK_LINKS.map((link) => {
        const active = isActive(link.path);

        return (
          <Button
            key={`${link.path}-${link.label}`}
            type={active ? 'primary' : 'text'}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </Button>
        );
      })}
    </Space>
  );
}

export default NavbarQuickLinks;
