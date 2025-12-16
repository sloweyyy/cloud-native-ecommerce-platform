import React from 'react';
import { Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

type ProductDescriptionProps = {
  description: string;
  rows?: number;
};

function ProductDescription(props: ProductDescriptionProps) {
  const { description, rows = 3 } = props;

  if (!description) {
    return null;
  }

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Title level={4}>Description</Title>
      <Paragraph
        ellipsis={{
          rows,
          expandable: true,
          symbol: 'Read more',
        }}
      >
        {description}
      </Paragraph>
    </Space>
  );
}

export default ProductDescription;
