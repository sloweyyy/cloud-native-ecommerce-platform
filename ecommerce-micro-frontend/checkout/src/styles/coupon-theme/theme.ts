import { theme, ThemeConfig } from 'antd';
import { couponTokensLight, couponTokensDark } from '../coupon-tokens';
import { Card } from './Card';
import { Tag } from './Tag';
import { Modal } from './Modal';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { Typography } from './Typography';
import { List } from './List';
import { Space } from './Space';

export const PREFIX_CLS = 'coupon';

/**
 * Coupon Theme Configuration (Light Mode)
 * Maps coupon design tokens to Ant Design tokens
 */
export const COUPON_THEME: ThemeConfig = {
  cssVar: true,
  hashed: false,
  algorithm: theme.defaultAlgorithm,
  token: {
    // Primary brand colors
    colorPrimary: couponTokensLight.brandPrimary,
    colorSuccess: couponTokensLight.statusSuccessDefault,
    colorWarning: couponTokensLight.statusWarningDefault,
    colorError: couponTokensLight.statusErrorDefault,
    colorInfo: couponTokensLight.statusInfoDefault,

    // Typography
    fontFamily: couponTokensLight.fontFamily,
    fontSize: couponTokensLight.fontSizeMd,
    fontSizeHeading1: couponTokensLight.fontSizeHero,
    fontSizeHeading2: couponTokensLight.fontSizeDisplay,
    fontSizeHeading3: couponTokensLight.fontSizeXxxl,
    fontSizeHeading4: couponTokensLight.fontSizeXxl,
    fontSizeHeading5: couponTokensLight.fontSizeXl,

    // Text colors
    colorText: couponTokensLight.contentDefault,
    colorTextBase: couponTokensLight.contentDefault,
    colorTextSecondary: couponTokensLight.contentSubtle,
    colorTextTertiary: couponTokensLight.contentDim,
    colorTextQuaternary: couponTokensLight.contentDisabled,
    colorTextPlaceholder: couponTokensLight.contentPlaceholder,

    // Background colors
    colorBgContainer: couponTokensLight.backgroundDefault,
    colorBgElevated: couponTokensLight.backgroundSurfaceLevel1,
    colorBgLayout: couponTokensLight.backgroundAlt,
    colorBgSpotlight: couponTokensLight.backgroundSurface,
    colorBgMask: couponTokensLight.backgroundOverlay,

    // Border colors
    colorBorder: couponTokensLight.outlineDefault,
    colorBorderSecondary: couponTokensLight.outlineSoft,

    // Border radius
    borderRadius: couponTokensLight.radiusMd,
    borderRadiusLG: couponTokensLight.radiusLg,
    borderRadiusSM: couponTokensLight.radiusSm,
    borderRadiusXS: couponTokensLight.radiusXs,

    // Spacing
    padding: couponTokensLight.spacingMd,
    paddingLG: couponTokensLight.spacingLg,
    paddingMD: couponTokensLight.spacingMd,
    paddingSM: couponTokensLight.spacingSm,
    paddingXS: couponTokensLight.spacingXs,
    paddingXXS: couponTokensLight.spacingXxs,

    margin: couponTokensLight.spacingMd,
    marginLG: couponTokensLight.spacingLg,
    marginMD: couponTokensLight.spacingMd,
    marginSM: couponTokensLight.spacingSm,
    marginXS: couponTokensLight.spacingXs,
    marginXXS: couponTokensLight.spacingXxs,

    // Shadows
    boxShadow: couponTokensLight.shadowSoft,
    boxShadowSecondary: couponTokensLight.shadowSubtle,
    boxShadowTertiary: couponTokensLight.shadowMedium,

    // Animation
    motionDurationFast: `${couponTokensLight.durationFast}ms`,
    motionDurationMid: `${couponTokensLight.durationNormal}ms`,
    motionDurationSlow: `${couponTokensLight.durationSlow}ms`,
    motionEaseInOut: couponTokensLight.easingStandard,
    motionEaseOut: couponTokensLight.easingDecelerate,

    // Success color variations
    colorSuccessBg: couponTokensLight.backgroundSuccess,
    colorSuccessBorder: couponTokensLight.outlineSuccess,
    colorSuccessHover: couponTokensLight.statusSuccessBold,
    colorSuccessActive: couponTokensLight.statusSuccessBoldest,

    // Error color variations
    colorErrorBg: couponTokensLight.backgroundError,
    colorErrorBorder: couponTokensLight.outlineError,
    colorErrorHover: couponTokensLight.statusErrorBold,
    colorErrorActive: couponTokensLight.statusErrorBoldest,

    // Info color variations
    colorInfoBg: couponTokensLight.backgroundInfo,
    colorInfoBorder: couponTokensLight.outlineInfo,
    colorInfoHover: couponTokensLight.statusInfoBold,
    colorInfoActive: couponTokensLight.statusInfoBoldest,

    // Warning color variations
    colorWarningBg: couponTokensLight.backgroundWarning,
    colorWarningBorder: couponTokensLight.outlineWarning,
    colorWarningHover: couponTokensLight.statusWarningBold,
    colorWarningActive: couponTokensLight.statusWarningBoldest,
  },
  components: {
    Card,
    Tag,
    Modal,
    Drawer,
    Button,
    Input,
    Badge,
    Typography,
    List,
    Space,
  },
};

/**
 * Coupon Dark Theme Configuration
 * Maps dark mode coupon tokens to Ant Design tokens
 */
export const COUPON_DARK_THEME: ThemeConfig = {
  cssVar: true,
  hashed: false,
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary brand colors
    colorPrimary: couponTokensDark.brandPrimary,
    colorSuccess: couponTokensDark.statusSuccessDefault,
    colorWarning: couponTokensDark.statusWarningDefault,
    colorError: couponTokensDark.statusErrorDefault,
    colorInfo: couponTokensDark.statusInfoDefault,

    // Typography
    fontFamily: couponTokensDark.fontFamily,
    fontSize: couponTokensDark.fontSizeMd,
    fontSizeHeading1: couponTokensDark.fontSizeHero,
    fontSizeHeading2: couponTokensDark.fontSizeDisplay,
    fontSizeHeading3: couponTokensDark.fontSizeXxxl,
    fontSizeHeading4: couponTokensDark.fontSizeXxl,
    fontSizeHeading5: couponTokensDark.fontSizeXl,

    // Text colors
    colorText: couponTokensDark.contentDefault,
    colorTextBase: couponTokensDark.contentDefault,
    colorTextSecondary: couponTokensDark.contentSubtle,
    colorTextTertiary: couponTokensDark.contentDim,
    colorTextQuaternary: couponTokensDark.contentDisabled,
    colorTextPlaceholder: couponTokensDark.contentPlaceholder,

    // Background colors
    colorBgContainer: couponTokensDark.backgroundDefault,
    colorBgElevated: couponTokensDark.backgroundSurfaceLevel1,
    colorBgLayout: couponTokensDark.backgroundAlt,
    colorBgSpotlight: couponTokensDark.backgroundSurface,
    colorBgMask: couponTokensDark.backgroundOverlay,

    // Border colors
    colorBorder: couponTokensDark.outlineDefault,
    colorBorderSecondary: couponTokensDark.outlineSoft,

    // Border radius (same as light)
    borderRadius: couponTokensDark.radiusMd,
    borderRadiusLG: couponTokensDark.radiusLg,
    borderRadiusSM: couponTokensDark.radiusSm,
    borderRadiusXS: couponTokensDark.radiusXs,

    // Spacing (same as light)
    padding: couponTokensDark.spacingMd,
    paddingLG: couponTokensDark.spacingLg,
    paddingMD: couponTokensDark.spacingMd,
    paddingSM: couponTokensDark.spacingSm,
    paddingXS: couponTokensDark.spacingXs,
    paddingXXS: couponTokensDark.spacingXxs,

    margin: couponTokensDark.spacingMd,
    marginLG: couponTokensDark.spacingLg,
    marginMD: couponTokensDark.spacingMd,
    marginSM: couponTokensDark.spacingSm,
    marginXS: couponTokensDark.spacingXs,
    marginXXS: couponTokensDark.spacingXxs,

    // Shadows (adjusted for dark mode)
    boxShadow: couponTokensDark.shadowSoft,
    boxShadowSecondary: couponTokensDark.shadowSubtle,
    boxShadowTertiary: couponTokensDark.shadowMedium,

    // Animation (same as light)
    motionDurationFast: `${couponTokensDark.durationFast}ms`,
    motionDurationMid: `${couponTokensDark.durationNormal}ms`,
    motionDurationSlow: `${couponTokensDark.durationSlow}ms`,
    motionEaseInOut: couponTokensDark.easingStandard,
    motionEaseOut: couponTokensDark.easingDecelerate,

    // Success color variations (dark)
    colorSuccessBg: couponTokensDark.backgroundSuccess,
    colorSuccessBorder: couponTokensDark.outlineSuccess,
    colorSuccessHover: couponTokensDark.statusSuccessBold,
    colorSuccessActive: couponTokensDark.statusSuccessBoldest,

    // Error color variations (dark)
    colorErrorBg: couponTokensDark.backgroundError,
    colorErrorBorder: couponTokensDark.outlineError,
    colorErrorHover: couponTokensDark.statusErrorBold,
    colorErrorActive: couponTokensDark.statusErrorBoldest,

    // Info color variations (dark)
    colorInfoBg: couponTokensDark.backgroundInfo,
    colorInfoBorder: couponTokensDark.outlineInfo,
    colorInfoHover: couponTokensDark.statusInfoBold,
    colorInfoActive: couponTokensDark.statusInfoBoldest,

    // Warning color variations (dark)
    colorWarningBg: couponTokensDark.backgroundWarning,
    colorWarningBorder: couponTokensDark.outlineWarning,
    colorWarningHover: couponTokensDark.statusWarningBold,
    colorWarningActive: couponTokensDark.statusWarningBoldest,
  },
  components: {
    Card,
    Tag,
    Modal,
    Drawer,
    Button,
    Input,
    Badge,
    Typography,
    List,
    Space,
  },
};

