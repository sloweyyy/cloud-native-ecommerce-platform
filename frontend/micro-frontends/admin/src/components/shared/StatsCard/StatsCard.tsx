import React from 'react';
import { Card, Statistic, Space, Typography, theme } from 'antd';
import type { IconType } from '../utils/iconUtils';
import { getIcon } from '../utils/iconUtils';

const { Text } = Typography;

type StatsCardProps = {
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

function StatsCard(props: StatsCardProps) {
  const {
    title,
    value,
    iconType,
    icon,
    prefix,
    precision,
    loading = false,
    hoverable = false,
    style,
    bodyStyle,
  } = props;
  const { token } = theme.useToken();

  function getPrefix() {
    if (prefix) {
      return prefix;
    }
    if (icon) {
      return icon;
    }
    if (iconType) {
      const IconComponent = getIcon(iconType);
      return <IconComponent style={{ fontSize: 28 }} />;
    }
    return undefined;
  }

  return (
    <Card
      loading={loading}
      hoverable={hoverable}
      bodyStyle={{
        padding: token.sizeUnit * 3,
        ...bodyStyle,
      }}
      style={{
        borderRadius: token.borderRadiusLG,
        height: '100%',
        ...style,
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space direction="vertical" size={2}>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {title}
          </Text>
          <Statistic
            value={value}
            precision={precision}
            valueStyle={{
              fontSize: token.fontSizeHeading3,
              fontWeight: 700,
            }}
            prefix={getPrefix()}
          />
        </Space>
      </Space>
    </Card>
  );
}

export default StatsCard;
