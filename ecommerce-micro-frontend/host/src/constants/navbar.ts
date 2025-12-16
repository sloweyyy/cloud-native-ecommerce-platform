export interface Category {
  key: string;
  label: string;
  path: string;
}

export const NAVBAR_CATEGORIES: Category[] = [
  { key: 'laptops', label: '💻 Laptops', path: '/store?cat=laptops' },
  { key: 'phones', label: '📱 Smartphones', path: '/store?cat=phones' },
  { key: 'tablets', label: '📱 Tablets', path: '/store?cat=tablets' },
  { key: 'audio', label: '🎧 Audio', path: '/store?cat=audio' },
  {
    key: 'accessories',
    label: '⌨️ Accessories',
    path: '/store?cat=accessories',
  },
  { key: 'gaming', label: '🎮 Gaming', path: '/store?cat=gaming' },
  { key: 'wearables', label: '⌚ Wearables', path: '/store?cat=wearables' },
  { key: 'cameras', label: '📷 Cameras', path: '/store?cat=cameras' },
];

export const PROMO_MESSAGES = {
  freeShipping: '🎉 FREE SHIPPING on orders over $50',
  flashSale: '⚡ Flash Sale - Up to 50% OFF',
} as const;

export const CONTACT_INFO = {
  phone: '(123) 456-7890',
  phoneLink: 'tel:1234567890',
} as const;




