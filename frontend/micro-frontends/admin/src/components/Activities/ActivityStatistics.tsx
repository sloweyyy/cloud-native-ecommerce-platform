import React, { useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Table,
  Empty,
  Spin,
  theme,
} from 'antd';
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  ApiOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { Activity } from '../../services/activities';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

export interface ActivityStatisticsProps {
  activities: Activity[];
  isLoading?: boolean;
}

interface StatisticsData {
  overview: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    growthRate: number;
  };
  byEntityType: Record<string, number>;
  byActivityType: Record<string, number>;
  bySourceService: Record<string, number>;
  byActor: Record<string, number>;
  topEntities: Array<{ entityId: string; entityType: string; count: number }>;
  topActors: Array<{ actor: string; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
}

/**
 * Activity Statistics Component
 *
 * Displays comprehensive statistics about activities including:
 * - Overview metrics (total, today, week, month, growth)
 * - Distribution by entity type, activity type, source service, actor
 * - Top entities and actors
 * - Time series data
 */
function ActivityStatistics({
  activities,
  isLoading = false,
}: ActivityStatisticsProps) {
  const { token } = theme.useToken();

  const statistics = useMemo<StatisticsData>(() => {
    const now = dayjs();
    const todayStart = now.startOf('day');
    const weekStart = now.startOf('week');
    const monthStart = now.startOf('month');
    const lastMonthStart = now.subtract(1, 'month').startOf('month');
    const lastMonthEnd = now.subtract(1, 'month').endOf('month');

    const todayActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(todayStart)
    );
    const weekActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(weekStart)
    );
    const monthActivities = activities.filter((a) =>
      dayjs(a.occurredAt).isAfter(monthStart)
    );
    const lastMonthActivities = activities.filter((a) => {
      const date = dayjs(a.occurredAt);
      return date.isAfter(lastMonthStart) && date.isBefore(lastMonthEnd);
    });

    const growthRate =
      lastMonthActivities.length > 0
        ? ((monthActivities.length - lastMonthActivities.length) /
            lastMonthActivities.length) *
          100
        : 0;

    const byEntityType: Record<string, number> = {};
    activities.forEach((a) => {
      byEntityType[a.entityType] = (byEntityType[a.entityType] || 0) + 1;
    });

    const byActivityType: Record<string, number> = {};
    activities.forEach((a) => {
      byActivityType[a.activityType] =
        (byActivityType[a.activityType] || 0) + 1;
    });

    const bySourceService: Record<string, number> = {};
    activities.forEach((a) => {
      bySourceService[a.sourceService] =
        (bySourceService[a.sourceService] || 0) + 1;
    });

    const byActor: Record<string, number> = {};
    activities.forEach((a) => {
      const actor = a.actor || 'system';
      byActor[actor] = (byActor[actor] || 0) + 1;
    });

    const entityCounts: Record<
      string,
      { entityId: string; entityType: string; count: number }
    > = {};
    activities.forEach((a) => {
      const key = `${a.entityType}_${a.entityId}`;
      if (!entityCounts[key]) {
        entityCounts[key] = {
          entityId: a.entityId,
          entityType: a.entityType,
          count: 0,
        };
      }
      entityCounts[key].count += 1;
    });
    const topEntities = Object.values(entityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top actors
    const topActors = Object.entries(byActor)
      .map(([actor, count]) => ({ actor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const timeSeriesMap: Record<string, number> = {};
    activities.forEach((a) => {
      const date = dayjs(a.occurredAt).format('YYYY-MM-DD');
      timeSeriesMap[date] = (timeSeriesMap[date] || 0) + 1;
    });
    const timeSeries = Object.entries(timeSeriesMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    return {
      overview: {
        total: activities.length,
        today: todayActivities.length,
        thisWeek: weekActivities.length,
        thisMonth: monthActivities.length,
        growthRate,
      },
      byEntityType,
      byActivityType,
      bySourceService,
      byActor,
      topEntities,
      topActors,
      timeSeries,
    };
  }, [activities]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: token.sizeUnit * 8 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <Empty description="No activities to display statistics" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Overview Cards */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Activities"
              value={statistics.overview.total}
              prefix={
                <FileTextOutlined style={{ color: token.colorPrimary }} />
              }
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today"
              value={statistics.overview.today}
              prefix={<FileTextOutlined style={{ color: token.colorInfo }} />}
              valueStyle={{ color: token.colorInfo }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="This Week"
              value={statistics.overview.thisWeek}
              prefix={
                <FileTextOutlined style={{ color: token.colorSuccess }} />
              }
              valueStyle={{ color: token.colorSuccess }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="This Month"
              value={statistics.overview.thisMonth}
              prefix={
                statistics.overview.growthRate >= 0 ? (
                  <ArrowUpOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <ArrowDownOutlined style={{ color: token.colorError }} />
                )
              }
              suffix={
                <Text
                  type={
                    statistics.overview.growthRate >= 0 ? 'success' : 'danger'
                  }
                  style={{ fontSize: token.fontSizeSM }}
                >
                  {statistics.overview.growthRate >= 0 ? '+' : ''}
                  {statistics.overview.growthRate.toFixed(1)}%
                </Text>
              }
              valueStyle={{
                color:
                  statistics.overview.growthRate >= 0
                    ? token.colorSuccess
                    : token.colorError,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Distribution Cards */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        {/* By Entity Type */}
        <Col xs={24} lg={12}>
          <Card title="By Entity Type" size="small">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {Object.entries(statistics.byEntityType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const percentage = (count / statistics.overview.total) * 100;
                  const isProduct = type === 'Product';
                  return (
                    <div key={type} style={{ width: '100%' }}>
                      <Space
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Space>
                          {isProduct ? (
                            <FileTextOutlined
                              style={{ color: token.colorInfo }}
                            />
                          ) : (
                            <ShoppingCartOutlined
                              style={{ color: token.colorSuccess }}
                            />
                          )}
                          <Text strong>{type}</Text>
                        </Space>
                        <Space>
                          <Text>{count}</Text>
                          <Text type="secondary">
                            ({percentage.toFixed(1)}%)
                          </Text>
                        </Space>
                      </Space>
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          backgroundColor: token.colorFillSecondary,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: isProduct
                              ? token.colorInfo
                              : token.colorSuccess,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </Space>
          </Card>
        </Col>

        {/* By Activity Type */}
        <Col xs={24} lg={12}>
          <Card title="By Activity Type" size="small">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {Object.entries(statistics.byActivityType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const percentage = (count / statistics.overview.total) * 100;
                  return (
                    <div key={type} style={{ width: '100%' }}>
                      <Space
                        style={{
                          width: '100%',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Space>
                          <Tag>{type}</Tag>
                          <Text>{count}</Text>
                        </Space>
                        <Text type="secondary">({percentage.toFixed(1)}%)</Text>
                      </Space>
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          backgroundColor: token.colorFillSecondary,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: token.colorPrimary,
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Source Service and Actor */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        <Col xs={24} lg={12}>
          <Card title="By Source Service" size="small">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {Object.entries(statistics.bySourceService)
                .sort(([, a], [, b]) => b - a)
                .map(([service, count]) => (
                  <Space
                    key={service}
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space>
                      <ApiOutlined style={{ color: token.colorWarning }} />
                      <Tag color="purple">{service}</Tag>
                    </Space>
                    <Text strong>{count}</Text>
                  </Space>
                ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="By Actor" size="small">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {Object.entries(statistics.byActor)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([actor, count]) => (
                  <Space
                    key={actor}
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space>
                      <UserOutlined
                        style={{ color: token.colorTextSecondary }}
                      />
                      <Text>{actor}</Text>
                    </Space>
                    <Text strong>{count}</Text>
                  </Space>
                ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Top Lists */}
      <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
        <Col xs={24} lg={12}>
          <Card title="Top Entities" size="small">
            <Table
              dataSource={statistics.topEntities}
              columns={[
                {
                  title: 'Entity',
                  dataIndex: 'entityId',
                  key: 'entityId',
                  render: (entityId: string, record) => (
                    <Space>
                      {record.entityType === 'Product' ? (
                        <FileTextOutlined style={{ color: token.colorInfo }} />
                      ) : (
                        <ShoppingCartOutlined
                          style={{ color: token.colorSuccess }}
                        />
                      )}
                      <Text code style={{ fontSize: token.fontSizeSM }}>
                        {entityId.length > 20
                          ? `${entityId.substring(0, 20)}...`
                          : entityId}
                      </Text>
                    </Space>
                  ),
                },
                {
                  title: 'Type',
                  dataIndex: 'entityType',
                  key: 'entityType',
                  render: (type: string) => (
                    <Tag color={type === 'Product' ? 'blue' : 'green'}>
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: 'Count',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'right' as const,
                },
              ]}
              pagination={false}
              size="small"
              rowKey={(record) => `${record.entityType}_${record.entityId}`}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Actors" size="small">
            <Table
              dataSource={statistics.topActors}
              columns={[
                {
                  title: 'Actor',
                  dataIndex: 'actor',
                  key: 'actor',
                  render: (actor: string) => (
                    <Space>
                      <UserOutlined
                        style={{ color: token.colorTextSecondary }}
                      />
                      <Text>{actor}</Text>
                    </Space>
                  ),
                },
                {
                  title: 'Activities',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'right' as const,
                },
              ]}
              pagination={false}
              size="small"
              rowKey="actor"
            />
          </Card>
        </Col>
      </Row>

      {/* Time Series Info */}
      {statistics.timeSeries.length > 0 && (
        <Card title="Activity Trends" size="small">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Showing last {statistics.timeSeries.length} days
            </Text>
            <Space wrap>
              {statistics.timeSeries.slice(-7).map((item) => (
                <Tag key={item.date}>
                  {dayjs(item.date).format('MMM DD')}: {item.count}
                </Tag>
              ))}
            </Space>
          </Space>
        </Card>
      )}
    </Space>
  );
}

export default ActivityStatistics;
