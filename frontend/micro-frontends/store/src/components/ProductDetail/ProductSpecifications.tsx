import React from 'react';
import { Typography, Descriptions } from 'antd';

const { Title } = Typography;

type ProductSpecificationsProps = {
  specifications: Record<string, string>;
};

function ProductSpecifications(props: ProductSpecificationsProps) {
  const { specifications } = props;

  const hasNoSpecifications =
    !specifications || Object.keys(specifications).length === 0;

  if (hasNoSpecifications) {
    return null;
  }

  const entries = Object.entries(specifications);

  return (
    <div>
      <Title level={4}>Specifications</Title>
      <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="small">
        {entries.map(([key, value]) => (
          <Descriptions.Item key={key} label={key}>
            {String(value)}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </div>
  );
}

export default ProductSpecifications;
