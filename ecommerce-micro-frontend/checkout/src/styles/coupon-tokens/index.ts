/**
 * Coupon Design Tokens - Main Export
 * Based on Duxton Design System pattern
 * Organized by category for easy consumption
 */

// Import individual token categories
import { couponBrandTokens, couponBrandTokensDark } from './brand';
import { couponStatusTokens, couponStatusTokensDark } from './status';
import { couponBackgroundTokens, couponBackgroundTokensDark } from './background';
import { couponContentTokens, couponContentTokensDark } from './content';
import { couponOutlineTokens, couponOutlineTokensDark } from './outline';
import { couponSpacingTokens, couponSpacingTokensDark } from './spacing';
import { couponTypographyTokens, couponTypographyTokensDark } from './typography';
import { couponAnimationTokens, couponAnimationTokensDark } from './animation';

// Export all token categories
export * from './brand';
export * from './status';
export * from './background';
export * from './content';
export * from './outline';
export * from './spacing';
export * from './typography';
export * from './animation';
export * from './themes';

// Light mode tokens (default)
export const couponTokensLight = {
  ...couponBrandTokens,
  ...couponStatusTokens,
  ...couponBackgroundTokens,
  ...couponContentTokens,
  ...couponOutlineTokens,
  ...couponSpacingTokens,
  ...couponTypographyTokens,
  ...couponAnimationTokens,
};

// Dark mode tokens
export const couponTokensDark = {
  ...couponBrandTokensDark,
  ...couponStatusTokensDark,
  ...couponBackgroundTokensDark,
  ...couponContentTokensDark,
  ...couponOutlineTokensDark,
  ...couponSpacingTokensDark,
  ...couponTypographyTokensDark,
  ...couponAnimationTokensDark,
};

// All tokens organized by category
export const couponTokensByCategory = {
  light: {
    brand: couponBrandTokens,
    status: couponStatusTokens,
    background: couponBackgroundTokens,
    content: couponContentTokens,
    outline: couponOutlineTokens,
    spacing: couponSpacingTokens,
    typography: couponTypographyTokens,
    animation: couponAnimationTokens,
  },
  dark: {
    brand: couponBrandTokensDark,
    status: couponStatusTokensDark,
    background: couponBackgroundTokensDark,
    content: couponContentTokensDark,
    outline: couponOutlineTokensDark,
    spacing: couponSpacingTokensDark,
    typography: couponTypographyTokensDark,
    animation: couponAnimationTokensDark,
  },
};

// Default export for easy import
export default couponTokensLight;

