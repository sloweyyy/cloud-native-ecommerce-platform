import React from 'react';
import { Tag, TagProps, Space, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export type StatusType = 'success' | 'warning' | 'error' | 'default' | 'processing';

interface StatusBadgeProps {
  status: string | null | undefined;
  type?: StatusType;
  showIcon?: boolean;
}

/**
 * StatusBadge Component
 * 
 * Consistent status indicator following UX requirements:
 * - Text + color (never color-only)
 * - Semantic color mapping
 * - Optional icon for clarity
 */
function StatusBadge({ status, type, showIcon = false }: StatusBadgeProps) {
  const statusText = status || 'Unknown';
  
  // Determine color from status text if type not provided
  const getStatusType = (): StatusType => {
    if (type) return type;
    
    const statusLower = statusText.toLowerCase();
    if (['completed', 'delivered', 'active', 'success'].includes(statusLower)) {
      return 'success';
    }
    if (['pending', 'processing', 'warning'].includes(statusLower)) {
      return 'warning';
    }
    if (['cancelled', 'failed', 'error', 'refunded'].includes(statusLower)) {
      return 'error';
    }
    if (['shipped', 'in-progress'].includes(statusLower)) {
      return 'processing';
    }
    return 'default';
  };

  const statusType = getStatusType();
  
  const iconMap: Record<StatusType, React.ReactNode> = {
    success: <CheckCircleOutlined />,
    warning: <ExclamationCircleOutlined />,
    error: <CloseCircleOutlined />,
    processing: <ClockCircleOutlined />,
    default: null,
  };

  const tagProps: TagProps = {
    color: statusType,
    children: (
      <Space size={4}>
        {showIcon && iconMap[statusType]}
        <Text>{statusText}</Text>
      </Space>
    ),
  };

  return <Tag {...tagProps} />;
}

export default React.memo(StatusBadge);

