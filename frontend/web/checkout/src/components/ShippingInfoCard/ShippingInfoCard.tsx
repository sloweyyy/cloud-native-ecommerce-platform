import React from 'react';

import { Card, Input, Select, Row, Col, Typography } from 'antd';

const { Text } = Typography;
const { TextArea } = Input;

type ShippingInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  notes: string;
};

type ShippingInfoCardProps = {
  shippingInfo: ShippingInfo;
  onShippingInfoChange: (info: ShippingInfo) => void;
};

function ShippingInfoCard(props: ShippingInfoCardProps) {
  const { shippingInfo, onShippingInfoChange } = props;

  function handleFieldChange(field: keyof ShippingInfo, value: string) {
    onShippingInfoChange({
      ...shippingInfo,
      [field]: value,
    });
  }

  return (
    <Card title="Shipping Information (Optional)" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Text>Full Name</Text>
          <Input
            placeholder="Your full name"
            value={shippingInfo.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text>Phone Number</Text>
          <Input
            placeholder="Your phone number"
            value={shippingInfo.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
          />
        </Col>
        <Col xs={24}>
          <Text>Address</Text>
          <Input
            placeholder="Street address"
            value={shippingInfo.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text>City</Text>
          <Input
            placeholder="City"
            value={shippingInfo.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Text>ZIP Code</Text>
          <Input
            placeholder="ZIP code"
            value={shippingInfo.zipCode}
            onChange={(e) => handleFieldChange('zipCode', e.target.value)}
          />
        </Col>
        <Col xs={24}>
          <Text>Country</Text>
          <Select
            style={{ width: '100%' }}
            value={shippingInfo.country}
            onChange={(value) => handleFieldChange('country', value)}
          >
            <Select.Option value="Vietnam">Vietnam</Select.Option>
            <Select.Option value="United States">United States</Select.Option>
            <Select.Option value="Japan">Japan</Select.Option>
            <Select.Option value="South Korea">South Korea</Select.Option>
            <Select.Option value="Singapore">Singapore</Select.Option>
          </Select>
        </Col>
        <Col xs={24}>
          <Text>Order Notes (Optional)</Text>
          <TextArea
            rows={3}
            placeholder="Special instructions for delivery"
            value={shippingInfo.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default React.memo(ShippingInfoCard);

