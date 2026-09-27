import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { theme } from 'antd';

type ActivitiesStatsCardsProps = {
  stats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
};

function ActivitiesStatsCards(props: ActivitiesStatsCardsProps) {
  const { stats } = props;
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Today"
            value={stats.today}
            prefix={<CalendarOutlined style={{ color: token.colorPrimary }} />}
            valueStyle={{ color: token.colorPrimary }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="This Week"
            value={stats.thisWeek}
            prefix={<CalendarOutlined style={{ color: token.colorInfo }} />}
            valueStyle={{ color: token.colorInfo }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="This Month"
            value={stats.thisMonth}
            prefix={<CalendarOutlined style={{ color: token.colorSuccess }} />}
            valueStyle={{ color: token.colorSuccess }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total"
            value={stats.total}
            prefix={<FileTextOutlined style={{ color: token.colorWarning }} />}
            valueStyle={{ color: token.colorWarning }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default ActivitiesStatsCards;
