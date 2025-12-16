import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

type ProductTitleProps = {
  name: string;
};

function ProductTitle(props: ProductTitleProps) {
  const { name } = props;

  return (
    <Title level={2} style={{ marginBottom: 8 }}>
      {name}
    </Title>
  );
}

export default ProductTitle;
