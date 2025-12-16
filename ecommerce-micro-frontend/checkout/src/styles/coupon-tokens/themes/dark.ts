/**
 * Coupon Dark Theme Tokens
 * Aggregates all dark mode tokens
 */

import { couponBrandTokensDark } from '../brand';
import { couponStatusTokensDark } from '../status';
import { couponBackgroundTokensDark } from '../background';
import { couponContentTokensDark } from '../content';
import { couponOutlineTokensDark } from '../outline';
import { couponSpacingTokensDark } from '../spacing';
import { couponTypographyTokensDark } from '../typography';
import { couponAnimationTokensDark } from '../animation';

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

export default couponTokensDark;

