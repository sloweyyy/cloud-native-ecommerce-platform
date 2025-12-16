import React, { useMemo } from 'react';
import { Space, Tag, Typography } from 'antd';
import {
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getDeliveryEstimate } from '../../helpers/productUtils';
import { formatCurrency, formatDate } from '../../helpers/formatUtils';

const { Text } = Typography;

type ShippingInfoProps = {
  shippingFreeShipping?: boolean;
  shippingEstimatedDeliveryDays?: number;
  shippingCost?: number;
};

function ShippingInfo(props: ShippingInfoProps) {
  const { shippingFreeShipping, shippingEstimatedDeliveryDays, shippingCost } =
    props;

  const shippingItems = useMemo(() => {
    const items = [];

    if (shippingFreeShipping) {
      items.push(
        <Space>
          <TruckOutlined style={{ color: '#00b14f' }} />
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Free Shipping
          </Tag>
        </Space>
      );
    }

    if (shippingEstimatedDeliveryDays !== undefined) {
      const deliveryDate = getDeliveryEstimate(
        new Date(),
        shippingEstimatedDeliveryDays
      );
      items.push(
        <Space>
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <Typography.Text>
            Estimated delivery: <Text strong>{formatDate(deliveryDate)}</Text>
          </Typography.Text>
        </Space>
      );
    }

    if (!shippingFreeShipping && shippingCost !== undefined) {
      items.push(
        <Space>
          <TruckOutlined />
          <Typography.Text>
            Shipping: <Text strong>{formatCurrency(shippingCost)}</Text>
          </Typography.Text>
        </Space>
      );
    }

    items.push(
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        30-day return policy
      </Typography.Text>
    );

    return items;
  }, [shippingFreeShipping, shippingEstimatedDeliveryDays, shippingCost]);

  return (
    <div>
      <Space direction="vertical" size="small">
        {shippingItems.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </Space>
    </div>
  );
}

export default ShippingInfo;
