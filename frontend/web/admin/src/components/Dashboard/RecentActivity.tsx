import React from 'react';
import { Card, Space, Typography, Button, Tag, Divider, theme } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { getIcon } from '../shared/utils/iconUtils';

const { Text } = Typography;

type RecentActivityItem = {
  id: string;
  entityType: string;
  activityType: string;
  title: string;
  description: string;
  timeAgo: string;
};

type RecentActivityProps = {
  activities: RecentActivityItem[];
  isLoading: boolean;
  onViewAll: () => void;
  onActivityClick: () => void;
};

function RecentActivity(props: RecentActivityProps) {
  const { activities, isLoading, onViewAll, onActivityClick } = props;
  const { token } = theme.useToken();

  return (
    <Card
      title={
        <Text strong style={{ fontSize: token.fontSizeLG }}>
          Recent Activity
        </Text>
      }
      loading={isLoading}
      bodyStyle={{ padding: token.sizeUnit * 4 }}
      extra={
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          size="small"
          onClick={onViewAll}
        >
          View All
        </Button>
      }
    >
      {activities.length === 0 && !isLoading ? (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          No recent activities
        </Text>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {activities.map((activity, index) => (
            <Space
              key={activity.id}
              direction="vertical"
              size={0}
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={onActivityClick}
            >
              <Space
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Space size={token.sizeUnit * 2}>
                  <Space
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: token.borderRadius,
                      background: token.colorFillTertiary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {React.createElement(getIcon(activity.entityType))}
                  </Space>
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: token.fontSizeSM }}>
                      {activity.title}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: token.fontSizeSM }}
                    >
                      {activity.description}
                    </Text>
                  </Space>
                </Space>
                <Tag style={{ margin: 0 }}>{activity.timeAgo}</Tag>
              </Space>
              {index < activities.length - 1 && (
                <Divider style={{ margin: `${token.sizeUnit * 3}px 0 0 0` }} />
              )}
            </Space>
          ))}
        </Space>
      )}
    </Card>
  );
}

export default RecentActivity;
