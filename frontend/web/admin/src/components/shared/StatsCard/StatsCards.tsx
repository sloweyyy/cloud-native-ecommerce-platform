import React from 'react';
import { Row, Col, theme } from 'antd';
import StatsCard from './StatsCard';
import type { IconType } from '../utils/iconUtils';

type StatisticItem = {
  title: string;
  value: number;
  iconType?: IconType | string;
  icon?: React.ReactNode;
  prefix?: string | React.ReactNode;
  precision?: number;
  loading?: boolean;
  hoverable?: boolean;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
};

type StatsCardsProps = {
  statistics: StatisticItem[];
  colSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
};

function StatsCards(props: StatsCardsProps) {
  const { statistics, colSpan = { xs: 24, sm: 12, lg: 6 } } = props;
  const { token } = theme.useToken();

  return (
    <Row gutter={[token.sizeUnit * 2, token.sizeUnit * 2]}>
      {statistics.map((stat, index) => (
        <Col
          xs={colSpan.xs}
          sm={colSpan.sm}
          md={colSpan.md}
          lg={colSpan.lg}
          xl={colSpan.xl}
          key={index}
        >
          <StatsCard {...stat} />
        </Col>
      ))}
    </Row>
  );
}

export default StatsCards;
