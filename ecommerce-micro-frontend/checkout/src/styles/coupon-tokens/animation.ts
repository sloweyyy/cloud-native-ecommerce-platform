/**
 * Coupon Animation Design Tokens
 * Based on Material Design motion principles
 */

export const couponAnimationTokens = {
  // Animation durations
  durationInstant: 100,
  durationFast: 150,
  durationNormal: 250,
  durationSlow: 350,
  durationSlower: 500,

  // Easing curves
  easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingDecelerate: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easingAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  easingSharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  easingEase: 'ease',
  easingEaseIn: 'ease-in',
  easingEaseOut: 'ease-out',
  easingEaseInOut: 'ease-in-out',

  // Transition strings (complete)
  transitionFast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transitionNormal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Transform values
  scaleUp: 1.02,
  scaleDown: 0.98,
  scaleNormal: 1,

  // Shadows (for elevation animation)
  shadowSubtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowSoft: '0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowMedium: '0 4px 16px rgba(0, 0, 0, 0.12)',
  shadowStrong: '0 6px 24px rgba(0, 0, 0, 0.16)',
  shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.20)',
};

// Animation tokens consistent across themes (shadows differ slightly)
export const couponAnimationTokensDark = {
  ...couponAnimationTokens,
  // Adjusted shadows for dark mode
  shadowSubtle: '0 1px 2px rgba(0, 0, 0, 0.24)',
  shadowSoft: '0 2px 8px rgba(0, 0, 0, 0.32)',
  shadowMedium: '0 4px 16px rgba(0, 0, 0, 0.40)',
  shadowStrong: '0 6px 24px rgba(0, 0, 0, 0.48)',
  shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.56)',
};

