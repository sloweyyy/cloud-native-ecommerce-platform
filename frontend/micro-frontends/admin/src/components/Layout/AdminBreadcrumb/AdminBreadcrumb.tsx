import React, { useMemo } from 'react';
import { Breadcrumb, theme } from 'antd';
import { useLocation, Link } from '@tanstack/react-router';

/**
 * AdminBreadcrumb Component
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility for breadcrumb navigation
 */
function AdminBreadcrumb() {
  // 1. Other hooks
  const location = useLocation();
  const { token } = theme.useToken();

  // 2. Memoized values
  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const items: Array<{ title: React.ReactNode }> = [];

    // Always start with "Admin" as the first breadcrumb item
    items.push({
      title: <Link to="/">Admin</Link>,
    });

    // Filter out 'admin' from pathnames if it exists (handles /admin/products case)
    const filteredPathnames = pathnames.filter((path) => path !== 'admin');

    // If no path segments after filtering, or we're at root, show "Dashboard"
    if (filteredPathnames.length === 0) {
      items.push({
        title: 'Dashboard',
      });
    } else {
      // Build breadcrumb items from filtered pathnames
      filteredPathnames.forEach((path, index) => {
        const isLast = index === filteredPathnames.length - 1;
        // Build href relative to root - router will handle basepath automatically
        const pathSegments = filteredPathnames.slice(0, index + 1);
        const href = '/' + pathSegments.join('/');
        const title =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        items.push({
          title: isLast ? title : <Link to={href}>{title}</Link>,
        });
      });
    }

    return items;
  }, [location.pathname]);

  // 3. Main render
  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{
        marginBottom: token.sizeUnit * 4,
      }}
    />
  );
}

export default React.memo(AdminBreadcrumb);
