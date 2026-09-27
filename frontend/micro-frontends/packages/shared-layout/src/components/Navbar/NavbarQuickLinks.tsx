import { useLocation } from 'react-router-dom';
import { Space, Button } from 'antd';
import { useNavigate } from '../../utils/navigation-handler';
import { isStandaloneMode } from '../../utils/navigation';

interface QuickLink {
  path: string;
  label: string;
  special?: boolean;
}

const QUICK_LINKS: QuickLink[] = [
  { path: '/', label: 'Home' },
  { path: '/store', label: 'Store' },
];

interface NavbarQuickLinksProps {
  appName?: string;
}

function NavbarQuickLinks({ appName }: NavbarQuickLinksProps) {
  const navigate = useNavigate(appName);
  const location = useLocation();
  const isStandalone = isStandaloneMode();

  // Get current pathname, accounting for standalone mode
  const getCurrentPath = () => {
    if (isStandalone && appName === 'store') {
      // In standalone store mode, '/' should be treated as '/store'
      // Also check window.location to sync with TanStack Router
      const windowPath = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
      // If we're at root and it's store standalone, treat as store
      if (windowPath === '/' || windowPath === '') {
        return '/store';
      }
      return windowPath;
    }
    return location.pathname;
  };

  const currentPath = getCurrentPath();

  const isActive = (path: string) => {
    if (path === '/') {
      // In standalone store mode, '/' should not be active
      if (isStandalone && appName === 'store') {
        return false;
      }
      return currentPath === path || currentPath === '';
    }
    // For '/store', also match '/' in standalone store mode
    if (path === '/store' && isStandalone && appName === 'store' && (currentPath === '/' || currentPath === '')) {
      return true;
    }
    return currentPath.startsWith(path);
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

