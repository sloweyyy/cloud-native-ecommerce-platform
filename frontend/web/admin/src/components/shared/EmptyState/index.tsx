import React, { ReactNode } from 'react';
import { Empty, Button, Space, Typography, theme } from 'antd';

const { Text } = Typography;

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  image?: ReactNode;
}

/**
 * EmptyState Component
 * 
 * Meaningful empty states following UX requirements:
 * - Explain why empty
 * - Provide next action
 */
function EmptyState({ title, description, action, image }: EmptyStateProps) {
  const { token } = theme.useToken();

  return (
    <Empty
      image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <Space direction="vertical" size="small" align="center">
          <Text strong style={{ fontSize: token.fontSizeLG }}>
            {title}
          </Text>
          {description && (
            <Text type="secondary" style={{ fontSize: token.fontSize }}>
              {description}
            </Text>
          )}
        </Space>
      }
    >
      {action && (
        <Button type="primary" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Empty>
  );
}

export default React.memo(EmptyState);

