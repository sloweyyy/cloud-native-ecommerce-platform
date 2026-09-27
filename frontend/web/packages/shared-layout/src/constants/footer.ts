export interface FooterLink {
  label: string;
  path: string;
}

export interface SocialLink {
  name: string;
  url: string;
  ariaLabel: string;
}

export const FOOTER_NAV_LINKS: FooterLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/store' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const FOOTER_CONTACT = {
  phone: '(123) 456-7890',
  email: 'support@nexttech.com',
  address: '123 Tech Avenue, CA',
} as const;

export const FOOTER_SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'facebook',
    url: 'https://facebook.com/nexttech',
    ariaLabel: 'Visit us on Facebook',
  },
  {
    name: 'instagram',
    url: 'https://instagram.com/nexttech',
    ariaLabel: 'Follow us on Instagram',
  },
  {
    name: 'twitter',
    url: 'https://twitter.com/nexttech',
    ariaLabel: 'Follow us on Twitter',
  },
  {
    name: 'linkedin',
    url: 'https://linkedin.com/company/nexttech',
    ariaLabel: 'Connect with us on LinkedIn',
  },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Cookie Policy', path: '/cookies' },
];

export const FOOTER_BRAND = {
  name: 'NextTech',
  description:
    'Your premier destination for cutting-edge tech gadgets and accessories. Empowering your digital lifestyle since 2023.',
  copyright: '© 2023 NextTech. All rights reserved.',
} as const;

