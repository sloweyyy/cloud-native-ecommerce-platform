import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined } from '@ant-design/icons';
import { NavbarActionButton } from './NavbarActionButton';

interface NotificationButtonProps {
  /** Number of unread notifications */
  count?: number;
}

/**
 * Notification button component for the navbar
 * Displays bell icon with notification count badge
 */
export const NotificationButton: React.FC<NotificationButtonProps> = ({
  count = 0,
}) => {
  const navigate = useNavigate();

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
