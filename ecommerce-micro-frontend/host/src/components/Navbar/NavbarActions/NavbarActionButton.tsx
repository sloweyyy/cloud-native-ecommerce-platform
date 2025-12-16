import React from 'react';
import { Button, Typography, Badge } from 'antd';

const { Text } = Typography;

/**
 * Common styles for navbar action buttons
 */
export const navbarActionButtonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '12px 16px',
  borderRadius: 12,
  color: '#64748b',
  height: 'auto',
};

/**
 * Label text style for navbar action buttons
 */
export const navbarActionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
};

interface NavbarActionButtonProps {
  /** Icon to display (can be an Ant Design icon or custom React node like Avatar) */
  icon: React.ReactNode;
  /** Label text below the icon */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility label */
  ariaLabel?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Badge count (optional) */
  badgeCount?: number;
  /** Whether to show badge when count is zero */
  showZeroBadge?: boolean;
  /** Badge size */
  badgeSize?: 'default' | 'small';
  /** Mouse enter handler (for hover previews) */
  onMouseEnter?: () => void;
  /** Mouse leave handler (for hover previews) */
  onMouseLeave?: () => void;
  /** Children to render after the button (e.g., CartPreview) */
  children?: React.ReactNode;
}

/**
 * Base button component for navbar actions
 *
 * Provides consistent styling and behavior for all navbar action buttons.
 * Supports optional badge, custom icons (including Avatar), and hover events.
 *
 * @example
 * // Simple button
 * <NavbarActionButton icon={<HeartOutlined />} label="Wishlist" onClick={handleClick} />
 *
 * @example
 * // With badge
 * <NavbarActionButton icon={<BellOutlined />} label="Notifications" badgeCount={5} />
 *
 * @example
 * // With custom icon (Avatar)
 * <NavbarActionButton icon={<Avatar icon={<UserOutlined />} />} label="Account" />
 */
export const NavbarActionButton: React.FC<NavbarActionButtonProps> = ({
  icon,
  label,
  onClick,
  ariaLabel,
  style,
  badgeCount,
  showZeroBadge = false,
  badgeSize = 'small',
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  const buttonContent = (
    <Button
      type="text"
      onClick={onClick}
      style={{ ...navbarActionButtonStyle, ...style }}
      aria-label={ariaLabel || label}
    >
      {icon}
      <Text style={navbarActionLabelStyle}>{label}</Text>
    </Button>
  );

  // Wrap with Badge if badgeCount is provided
  const buttonWithBadge =
    badgeCount !== undefined ? (
      <Badge count={badgeCount} size={badgeSize} showZero={showZeroBadge}>
        {buttonContent}
      </Badge>
    ) : (
      buttonContent
    );

  // If there are mouse handlers or children, wrap in a container
  if (onMouseEnter || onMouseLeave || children) {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ position: 'relative' }}
      >
        {buttonWithBadge}
        {children}
      </div>
    );
  }

  return buttonWithBadge;
};

export default NavbarActionButton;
