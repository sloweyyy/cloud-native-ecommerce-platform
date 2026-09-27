/**
 * Product Card Layout Constants
 * Centralized design values for consistent product card styling
 */
export const PRODUCT_CARD = {
  /**
   * Height of the product card cover/image area
   */
  COVER_HEIGHT: 280,

  /**
   * Padding inside the card body
   */
  PADDING: 24,

  /**
   * Fixed height for product title (2 lines)
   */
  TITLE_HEIGHT: 44,

  /**
   * Fixed height for product description (2 lines)
   */
  DESCRIPTION_HEIGHT: 36,

  /**
   * Border radius for card corners
   */
  BORDER_RADIUS: 8,

  /**
   * Distance card lifts on hover
   */
  HOVER_LIFT: 4,

  /**
   * Badge positioning
   */
  BADGE: {
    TOP: 12,
    RIGHT: 12,
    Z_INDEX: 10,
  },

  /**
   * Spacing between elements
   */
  SPACING: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 16,
    XLARGE: 20,
  },

  /**
   * Typography sizes
   */
  FONT_SIZE: {
    PRICE: 24,
    ORIGINAL_PRICE: 16,
    TITLE: 16,
    DESCRIPTION: 12,
    BADGE: 12,
  },

  /**
   * Typography weights
   */
  FONT_WEIGHT: {
    PRICE: 700,
    TITLE: 600,
    BADGE: 600,
  },

  /**
   * Line heights
   */
  LINE_HEIGHT: {
    PRICE: 32,
    TITLE: 22,
    DESCRIPTION: 18,
  },
} as const;

/**
 * Badge color configurations using Duxton design tokens
 */
export const BADGE_COLORS = {
  new: {
    background: '#00b14f', // colorStatusPositiveDefault (Duxton green)
    color: '#ffffff', // colorBaseNeutralWhite
  },
  discount: {
    background: '#d42e1c', // colorStatusAlertDefault (Duxton red)
    color: '#ffffff', // colorBaseNeutralWhite
  },
  hot: {
    background: '#f09800', // colorStatusNoticeDefault (Duxton orange/yellow)
    color: '#ffffff', // colorBaseNeutralWhite
  },
  default: {
    background: '#dbdbdb', // colorBaseNeutral100
    color: '#1a1a1a', // colorContentDefault
  },
} as const;

/**
 * Product card colors using Duxton design tokens
 */
export const PRODUCT_CARD_COLORS = {
  BACKGROUND: '#ffffff', // colorBackgroundDefault
  BORDER: '#e8e8e8', // colorOutlineSoftest
  COVER_BACKGROUND: '#f5f5f5', // colorBaseNeutral50
  ICON_PLACEHOLDER: '#dbdbdb', // colorBaseNeutral100
  TITLE: '#1a1a1a', // colorContentDefault
  DESCRIPTION: '#8c8c8c', // colorBaseNeutral400
  PRICE: '#1a1a1a', // colorContentDefault
  ORIGINAL_PRICE: '#bfbfbf', // colorBaseNeutral200
  HOVER_OVERLAY: 'rgba(26, 26, 26, 0.5)', // Based on colorContentDefault with opacity
} as const;
