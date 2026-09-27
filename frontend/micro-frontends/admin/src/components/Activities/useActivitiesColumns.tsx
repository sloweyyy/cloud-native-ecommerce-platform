import React, { useMemo, useCallback } from 'react';
import { Button, Tag, Space, Typography } from 'antd';
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  LinkOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { theme } from 'antd';
import dayjs from 'dayjs';
import type { Activity } from '../../services/activities';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

type UseActivitiesColumnsProps = {
  onActivityClick: (activity: Activity) => void;
  onViewEntity: (activity: Activity) => void;
};

export function useActivitiesColumns(props: UseActivitiesColumnsProps) {
  const { onActivityClick, onViewEntity } = props;
  const { token } = theme.useToken();

  const getActivityDisplay = useCallback(
    (activity: Activity) => {
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
    },
    [token]
  );

  const columns: ColumnsType<Activity> = useMemo(
    () => [
      {
        title: 'Type',
        dataIndex: 'entityType',
        key: 'entityType',
        width: 100,
        render: (type: string, record: Activity) => {
          const display = getActivityDisplay(record);
          return (
            <Tag color={display.color} icon={display.icon}>
              {type}
            </Tag>
          );
        },
      },
      {
        title: 'Activity',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (title: string, record: Activity) => (
          <Button
            type="link"
            onClick={() => onActivityClick(record)}
            style={{ padding: 0, height: 'auto' }}
          >
            {title}
          </Button>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: (description: string | null) => (
          <Text type="secondary">{description || '-'}</Text>
        ),
      },
      {
        title: 'Entity',
        dataIndex: 'entityId',
        key: 'entityId',
        width: 200,
        render: (entityId: string, record: Activity) => (
          <Space>
            <Text code>
              {entityId.length > 20
                ? `${entityId.substring(0, 20)}...`
                : entityId}
            </Text>
            <Button
              type="link"
              size="small"
              icon={<LinkOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onViewEntity(record);
              }}
            />
          </Space>
        ),
      },
      {
        title: 'Actor',
        dataIndex: 'actor',
        key: 'actor',
        width: 120,
        render: (actor: string | null) => (
          <Space>
            <Text>{actor || 'system'}</Text>
          </Space>
        ),
      },
      {
        title: 'Source',
        dataIndex: 'sourceService',
        key: 'sourceService',
        width: 100,
        render: (service: string) => (
          <Tag icon={<ApiOutlined />} color="purple">
            {service}
          </Tag>
        ),
      },
      {
        title: 'Time',
        dataIndex: 'occurredAt',
        key: 'occurredAt',
        width: 150,
        sorter: (a: Activity, b: Activity) =>
          dayjs(a.occurredAt).unix() - dayjs(b.occurredAt).unix(),
        render: (occurredAt: string, record: Activity) => (
          <Text type="secondary">
            {record.timeAgo || dayjs(occurredAt).fromNow()}
          </Text>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        render: (_: unknown, record: Activity) => (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => onActivityClick(record)}
              size="small"
            />
            <Button
              type="link"
              icon={<LinkOutlined />}
              onClick={() => onViewEntity(record)}
              size="small"
            />
          </Space>
        ),
      },
    ],
    [getActivityDisplay, onActivityClick, onViewEntity]
  );

  return columns;
}
