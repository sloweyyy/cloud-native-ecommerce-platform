import React from 'react';
import {
  Modal,
  Space,
  Typography,
  Button,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  theme,
} from 'antd';
import {
  LinkOutlined,
  EyeOutlined,
  UserOutlined,
  ApiOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Activity } from '../../services/activities';

const { Text } = Typography;

type ActivityDetailModalProps = {
  open: boolean;
  activity: Activity | null;
  relatedActivities: Activity[];
  onClose: () => void;
  onViewEntity: (activity: Activity) => void;
  onViewAllEntityTypeActivities: () => void;
  onViewAllRelatedActivities: () => void;
  onRelatedActivityClick: (activity: Activity) => void;
};

function ActivityDetailModal(props: ActivityDetailModalProps) {
  const {
    open,
    activity,
    relatedActivities,
    onClose,
    onViewEntity,
    onViewAllEntityTypeActivities,
    onViewAllRelatedActivities,
    onRelatedActivityClick,
  } = props;
  const { token } = theme.useToken();

  function getActivityDisplay(activity: Activity) {
    if (activity.entityType === 'Product') {
      return {
        icon: <FileTextOutlined style={{ color: token.colorInfo }} />,
        color: 'blue',
        bgColor: token.colorInfoBg,
      };
    }
    if (activity.entityType === 'Order') {
      return {
        icon: <ShoppingCartOutlined style={{ color: token.colorSuccess }} />,
        color: 'green',
        bgColor: token.colorSuccessBg,
      };
    }
    return {
      icon: <FileTextOutlined style={{ color: token.colorTextSecondary }} />,
      color: 'default',
      bgColor: token.colorFillTertiary,
    };
  }

  if (!activity) return null;

  const display = getActivityDisplay(activity);

  return (
    <Modal
      title={
        <Space>
          {display.icon}
          <Text strong>Activity Details</Text>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="viewEntity"
          type="primary"
          icon={<LinkOutlined />}
          onClick={() => onViewEntity(activity)}
        >
          View {activity.entityType}
        </Button>,
      ]}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small" style={{ background: display.bgColor }}>
          <Space direction="vertical" size="small">
            <Text strong>{activity.title}</Text>
            <Text type="secondary">
              {activity.description || 'No description'}
            </Text>
            <Space>
              <Tag color={display.color}>{activity.entityType}</Tag>
              <Tag>{activity.activityType}</Tag>
              <Text type="secondary">
                {activity.timeAgo || dayjs(activity.occurredAt).fromNow()}
              </Text>
            </Space>
          </Space>
        </Card>

        <Card size="small" title="Quick Actions">
          <Space wrap>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => onViewEntity(activity)}
            >
              View {activity.entityType}
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={onViewAllEntityTypeActivities}
            >
              View All {activity.entityType} Activities
            </Button>
          </Space>
        </Card>

        <Card size="small" title="Entity Information">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Entity Type">
              <Tag color={display.color}>{activity.entityType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Entity ID">
              <Text code>{activity.entityId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Activity Type">
              <Tag>{activity.activityType}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card size="small" title="Activity Metadata">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Actor">
              <Space>
                <UserOutlined />
                <Text>{activity.actor || 'system'}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Source Service">
              <Space>
                <ApiOutlined />
                <Tag color="purple">{activity.sourceService}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Occurred At">
              <Space>
                <CalendarOutlined />
                <Text>
                  {dayjs(activity.occurredAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Time Ago">
              <Text type="secondary">
                {activity.timeAgo || dayjs(activity.occurredAt).fromNow()}
              </Text>
            </Descriptions.Item>
            {activity.createdDate && (
              <Descriptions.Item label="Created Date">
                {dayjs(activity.createdDate).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {relatedActivities.length > 0 && (
          <Card
            size="small"
            title={`Related Activities (${relatedActivities.length})`}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {relatedActivities.map((relatedActivity) => {
                const relatedDisplay = getActivityDisplay(relatedActivity);
                return (
                  <Card
                    key={relatedActivity.id}
                    size="small"
                    hoverable
                    onClick={() => onRelatedActivityClick(relatedActivity)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Row
                      justify="space-between"
                      align="middle"
                      style={{ width: '100%' }}
                    >
                      <Col>
                        <Space>
                          {relatedDisplay.icon}
                          <Text strong>{relatedActivity.title}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Text type="secondary">
                          {relatedActivity.timeAgo ||
                            dayjs(relatedActivity.occurredAt).fromNow()}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
              <Button type="link" block onClick={onViewAllRelatedActivities}>
                View All Related Activities →
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
}

export default ActivityDetailModal;
