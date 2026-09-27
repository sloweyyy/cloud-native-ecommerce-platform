/**
 * Ant Design v5 Theme Configuration for Admin Module
 * 
 * Maps design tokens to Ant Design design tokens for consistent theming.
 * Optimized for admin dashboards with efficiency-first, density-optimized design.
 */

import type { ThemeConfig } from 'antd';

/**
 * Layout Dimensions (exported for component usage)
 */
export const layout = {
  sidebarWidth: 280,
  sidebarCollapsedWidth: 80,
  headerHeight: 64,
  contentPadding: 32,
  cardPadding: 24,
  tableRowHeight: 56,
};

/**
 * Admin Theme Configuration
 * 
 * Optimized for admin dashboards with efficiency-first, density-optimized design.
 */
export const adminThemeConfig: ThemeConfig = {
  token: {
    // Brand Colors - Primary Purple Gradient
    colorPrimary: '#667eea',
    colorPrimaryHover: '#7888ef',
    colorPrimaryActive: '#764ba2',
    
    // Content Colors
    colorText: '#1e293b',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorTextQuaternary: '#94a3b8',
    
    // Background Colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f8fafc',
    colorBgLayout: '#f1f5f9',
    colorBgSpotlight: '#f5f5f5',
    
    // Border Colors
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    
    // Status Colors
    colorError: '#ef4444',
    colorWarning: '#f59e0b',
    colorSuccess: '#52c41a',
    colorInfo: '#667eea',
    
    // Typography
    fontSize: 16,
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,
    
    // Border Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    
    // Spacing
    sizeUnit: 4,
    sizeStep: 4,
    
    // Shadows
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(102, 126, 234, 0.25)',
    
    // Line Height
    lineHeight: 1.5,
    
    // Control Height (dense for efficiency)
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: layout.headerHeight,
      headerPadding: `0 ${layout.contentPadding}px`,
      siderBg: '#ffffff',
      bodyBg: '#fafafa',
    },
    Menu: {
      itemHeight: 40,
      itemPaddingInline: 16,
      itemMarginInline: 4,
      itemBorderRadius: 8,
      subMenuItemBg: 'transparent',
      itemSelectedBg: '#f0f4ff',
      itemHoverBg: '#f8fafc',
      itemActiveBg: '#f0f4ff',
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#1e293b',
      rowHoverBg: '#f8fafc',
      borderColor: '#e2e8f0',
      cellPaddingBlock: 8,
      cellPaddingInline: 16,
      headerSplitColor: '#e2e8f0',
      stickyScrollBarBg: '#f8fafc',
    },
    Card: {
      paddingLG: 24,
      headerBg: 'transparent',
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 40,
      paddingInline: 16,
      fontWeight: 600,
      primaryShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    },
    Input: {
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 40,
      borderRadius: 8,
      paddingInline: 16,
    },
    Form: {
      labelFontSize: 14,
      labelHeight: 20,
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 4px',
    },
    Select: {
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 40,
      borderRadius: 8,
    },
    Tag: {
      borderRadius: 4,
      fontSizeSM: 12,
      lineHeight: 1.25,
    },
    Breadcrumb: {
      fontSize: 14,
      itemColor: '#475569',
      lastItemColor: '#1e293b',
      linkColor: '#475569',
      linkHoverColor: '#667eea',
    },
    Badge: {
      textFontSize: 12,
      statusSize: 8,
    },
    Alert: {
      borderRadius: 8,
      padding: 16,
    },
    Modal: {
      borderRadius: 12,
      paddingContentHorizontal: 32,
      paddingContentVertical: 24,
    },
    Drawer: {
      padding: 24,
    },
  },
};

/**
 * Dark Mode Theme Configuration
 */
export const adminDarkThemeConfig: ThemeConfig = {
  ...adminThemeConfig,
  token: {
    ...adminThemeConfig.token,
    // Dark mode overrides
    colorBgContainer: '#141414',
    colorBgLayout: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgSpotlight: '#1f1f1f',
    
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',
    
    colorText: '#ffffff',
    colorTextSecondary: '#bfbfbf',
    colorTextTertiary: '#8c8c8c',
    colorTextQuaternary: '#595959',
    
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    boxShadowSecondary: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  },
  components: {
    ...adminThemeConfig.components,
    Layout: {
      ...adminThemeConfig.components?.Layout,
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
      bodyBg: '#141414',
    },
    Menu: {
      ...adminThemeConfig.components?.Menu,
      itemSelectedBg: '#111b26',
      itemHoverBg: '#1f1f1f',
      itemActiveBg: '#111b26',
    },
    Table: {
      ...adminThemeConfig.components?.Table,
      headerBg: '#1f1f1f',
      headerColor: '#ffffff',
      rowHoverBg: '#1f1f1f',
      borderColor: '#434343',
    },
  },
};

