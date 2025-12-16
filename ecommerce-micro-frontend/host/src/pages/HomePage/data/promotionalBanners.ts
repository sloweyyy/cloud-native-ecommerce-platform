export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
}

export const promotionalBanners: PromotionalBanner[] = [
  {
    id: '1',
    title: 'Discover',
    subtitle: 'Amazing Black Friday Deals',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '/store',
  },
  {
    id: '2',
    title: 'Premium',
    subtitle: 'Quality Tech Products',
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '/store',
  },
  {
    id: '3',
    title: 'Stay',
    subtitle: 'Connected with Smart Gear',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '/store',
  },
  {
    id: '4',
    title: 'Power',
    subtitle: 'Up Your Tech Game',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    link: '/store',
  },
];




