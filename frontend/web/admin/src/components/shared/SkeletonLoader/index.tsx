import React from 'react';
import { Skeleton, Card, Space } from 'antd';

interface SkeletonLoaderProps {
  rows?: number;
  showAvatar?: boolean;
  showTitle?: boolean;
}

/**
 * SkeletonLoader Component
 * 
 * Skeleton loaders (not spinners) following UX requirements
 */
function SkeletonLoader({ rows = 5, showAvatar = false, showTitle = true }: SkeletonLoaderProps) {
  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {showTitle && <Skeleton.Input active size="large" style={{ width: 200, height: 32 }} />}
        <Skeleton
          active
          avatar={showAvatar ? { shape: 'square' } : false}
          paragraph={{ rows }}
        />
      </Space>
    </Card>
  );
}

export default React.memo(SkeletonLoader);

