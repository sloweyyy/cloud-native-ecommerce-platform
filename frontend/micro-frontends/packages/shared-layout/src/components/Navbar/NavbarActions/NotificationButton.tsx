import React from 'react';
import { BellOutlined } from '@ant-design/icons';
import { NavbarActionButton } from './NavbarActionButton';
import { useNavigate } from '../../../utils/navigation-handler';

interface NotificationButtonProps {
  /** Number of unread notifications */
  count?: number;
  /** Current app name for navigation fallback */
  appName?: string;
}

/**
 * Notification button component for the navbar
 * Displays bell icon with notification count badge
 */
export const NotificationButton: React.FC<NotificationButtonProps> = ({
  count = 0,
  appName,
}) => {
  const navigate = useNavigate(appName);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <NavbarActionButton
      icon={<BellOutlined />}
      label="Notifications"
      onClick={handleClick}
      ariaLabel="Notifications"
      badgeCount={count}
      badgeSize="small"
    />
  );
};

export default NotificationButton;

