import React from 'react';
import { ConfigProvider } from 'antd';
import { COUPON_THEME, COUPON_DARK_THEME, PREFIX_CLS } from '../styles/coupon-theme/theme';
import '../styles/coupon-theme/index.less';

interface CouponProviderProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

/**
 * CouponProvider
 * 
 * Wraps coupon components with themed ConfigProvider
 * Applies coupon-specific design tokens and component overrides
 * 
 * @param props - Component props
 * @param props.children - Child components to wrap
 * @param props.darkMode - Whether to use dark theme (default: false)
 */
function CouponProvider(props: CouponProviderProps) {
  // Props destructuring
  const { children, darkMode = false } = props;

  // Select theme based on darkMode prop
  const theme = darkMode ? COUPON_DARK_THEME : COUPON_THEME;

  return (
    <ConfigProvider theme={theme} prefixCls={PREFIX_CLS}>
      {children}
    </ConfigProvider>
  );
}

export default CouponProvider;

