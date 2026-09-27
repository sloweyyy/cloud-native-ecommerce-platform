import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { Button, Space, Typography, Row, Col, message, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';

import { AppInjectorProps } from '@ecommerce-platform/app-injector';
import { useAuth } from '@ecommerce-platform/auth-provider';
import {
  useGetBasket,
  useCheckout,
  useUpdateBasketItem,
  useRemoveBasketItem,
} from '../services/basket/hooks';
import OrderSummaryCard from '../components/OrderSummaryCard';
import ShippingInfoCard from '../components/ShippingInfoCard';
import PaymentMethodCard from '../components/PaymentMethodCard';
import OrderTotalCard from '../components/OrderTotalCard';
import {
  getUserEmail,
  handleNavigateToStore,
} from '../helpers/checkoutHelpers';
import type { BasketItem } from '../services/basket/schemas';

const { Title, Text, Paragraph } = Typography;

type CheckoutProps = {
  config?: AppInjectorProps['config'];
};

export default function Checkout(props: CheckoutProps) {
  const { config } = props;

  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Vietnam',
    notes: '',
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: basketResponse, isLoading, refetch: refetchBasket } = useGetBasket();
  const basket = basketResponse?.data ?? null;

  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: updateItem } = useUpdateBasketItem();
  const { mutate: removeItem } = useRemoveBasketItem();

  const handleUpdateQuantity = useCallback(
    (item: BasketItem, newQuantity: number) => {
      if (newQuantity < 1) return;
      updateItem({
        productId: item.productId,
        quantity: newQuantity,
      });
    },
    [updateItem]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      removeItem({ productId });
    },
    [removeItem]
  );

  useEffect(() => {
    refetchBasket();
  }, [refetchBasket]);

  const subtotal = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.price * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const originalTotal = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.originalPrice * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const totalSavings = useMemo(
    () =>
      basket?.items?.reduce(
        (sum: number, item: BasketItem) => sum + item.discountAmount * item.quantity,
        0
      ) ?? 0,
    [basket?.items]
  );

  const shipping = 0;
  const tax = 0;
  const total = useMemo(() => subtotal + shipping + tax, [subtotal]);

  function handlePlaceOrder() {
    if (!basket || !basket.items || basket.items.length === 0) {
      message.warning('Your cart is empty');
      return;
    }

    checkout(
      {
        totalPrice: basket.totalPrice,
        emailAddress: getUserEmail(user),
        addressLine: shippingInfo.address || 'N/A',
        country: shippingInfo.country || 'Vietnam',
        state: shippingInfo.city || 'N/A',
        zipCode: shippingInfo.zipCode || '00000',
        cardName: 'N/A',
        cardNumber: '0000000000000000',
        expiration: '12/99',
        cvv: '000',
        paymentMethod: paymentMethod,
      },
      {
        onSuccess: () => {
          message.success('Order placed successfully!');
          navigate({ to: '/' });
        },
        onError: () => {
          message.error('Failed to place order. Please try again.');
        },
      }
    );
  }

  function handleBackToShopping() {
    handleNavigateToStore(config);
  }

  if (isLoading) {
    return (
      <Space
        direction="vertical"
        align="center"
        style={{ width: '100%', padding: '100px 0' }}
      >
        <Spin size="large" />
      </Space>
    );
  }

  if (!basket || !basket.items || basket.items.length === 0) {
    return (
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: '100%', padding: '100px 20px' }}
      >
        <ShoppingCartOutlined style={{ fontSize: 64 }} />
        <Title level={3}>Your cart is empty</Title>
        <Paragraph>Add some products to continue with checkout.</Paragraph>
        <Button type="primary" onClick={handleBackToShopping}>
          Back to Shopping
        </Button>
      </Space>
    );
  }

  return (
    <Space
      direction='vertical'
      size="large"
      style={{
        margin: '0 auto',
        padding: '24px 16px',
        width: '100%',
      }}
      align='center'
    >
      {/* Header */}
      <Space direction="vertical" size="small" style={{ width: '100%', maxWidth: 1200 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToShopping}
          style={{ padding: 0 }}
        >
          Back to Shopping
        </Button>
        <Title level={2}>Checkout</Title>
        <Text type="secondary">Complete your purchase securely</Text>
        <Row gutter={[24, 24]}>
          {/* Left Column - Order Items & Forms */}
          <Col xs={24} lg={16}>
            <OrderSummaryCard
              items={basket.items}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />

            <PaymentMethodCard
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </Col>

          {/* Right Column - Order Total */}
          <Col xs={24} lg={8}>
            <OrderTotalCard
              originalTotal={originalTotal}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              totalSavings={totalSavings}
              isCheckingOut={isCheckingOut}
              onPlaceOrder={handlePlaceOrder}
            />

          </Col>
          <Col xs={24} lg={16}>
            <ShippingInfoCard
              shippingInfo={shippingInfo}
              onShippingInfoChange={setShippingInfo}
            />
          </Col>
        </Row>
      </Space>
    </Space>
  );
}
