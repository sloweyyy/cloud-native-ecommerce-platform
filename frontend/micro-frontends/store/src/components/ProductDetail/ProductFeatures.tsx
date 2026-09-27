import React from 'react';
import { Typography, List, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

type ProductFeaturesProps = {
  features: string[];
};

function ProductFeatures(props: ProductFeaturesProps) {
  const { features } = props;

  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div>
      <Title level={4}>Key Features</Title>
      <List
        dataSource={features}
        renderItem={(feature) => (
          <List.Item style={{ padding: '8px 0', border: 'none' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#00b14f' }} />
              <span>{feature}</span>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}

export default ProductFeatures;

