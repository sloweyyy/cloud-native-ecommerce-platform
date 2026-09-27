import React from 'react';
import { Typography, Button, Space, Flex } from 'antd';
import { themeConfig } from '../../../../config/theme';

const { Title, Text } = Typography;

type SectionHeaderProps = {
  title: string;
  subtitle: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
};

function SectionHeader(props: SectionHeaderProps) {
  const { title, subtitle, showViewAll = false, onViewAll } = props;

  return (
    <Flex
      justify="space-between"
      align="flex-end"
      style={{ width: '100%' }}
      wrap="wrap"
      gap="middle"
    >
      <Space direction="vertical" size="small" align="start">
        <Title
          level={2}
          style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: themeConfig.token?.colorText || '#1e293b',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {title}
        </Title>
        <Text
          style={{
            color: themeConfig.token?.colorTextTertiary || '#64748b',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </Text>
      </Space>
      {showViewAll && onViewAll && (
        <Button type="link" onClick={onViewAll}>
          View All Products →
        </Button>
      )}
    </Flex>
  );
}

export default SectionHeader;

