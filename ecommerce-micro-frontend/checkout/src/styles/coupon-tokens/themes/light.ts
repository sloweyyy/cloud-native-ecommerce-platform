/**
 * Coupon Light Theme Tokens
 * Aggregates all light mode tokens
 */

import { couponBrandTokens } from '../brand';
import { couponStatusTokens } from '../status';
import { couponBackgroundTokens } from '../background';
import { couponContentTokens } from '../content';
import { couponOutlineTokens } from '../outline';
import { couponSpacingTokens } from '../spacing';
import { couponTypographyTokens } from '../typography';
import { couponAnimationTokens } from '../animation';

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

export default couponTokensLight;

