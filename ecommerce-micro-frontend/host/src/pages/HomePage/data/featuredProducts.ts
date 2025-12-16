export interface FeaturedProduct {
  id: string;
  name: string;
  nameVi: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  link: string;
  category: string;
}

export const featuredProducts: FeaturedProduct[] = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    nameVi: 'MacBook Pro 16"',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 49990000,
    originalPrice: 54990000,
    discount: 9,
    rating: 4.9,
    reviewCount: 342,
    link: '/store/1',
    category: 'laptops',
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    nameVi: 'iPhone 15 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 24990000,
    rating: 4.8,
    reviewCount: 512,
    link: '/store/2',
    category: 'phones',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    nameVi: 'Sony WH-1000XM5',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 8990000,
    originalPrice: 10990000,
    discount: 18,
    rating: 4.7,
    reviewCount: 287,
    link: '/store/3',
    category: 'audio',
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    nameVi: 'iPad Pro 12.9"',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 29990000,
    rating: 4.6,
    reviewCount: 198,
    link: '/store/4',
    category: 'tablets',
  },
  {
    id: '5',
    name: 'Logitech MX Master 3',
    nameVi: 'Logitech MX Master 3',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 2490000,
    rating: 4.8,
    reviewCount: 421,
    link: '/store/5',
    category: 'accessories',
  },
  {
    id: '6',
    name: 'Keychron K8 Pro',
    nameVi: 'Keychron K8 Pro',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 3290000,
    originalPrice: 3990000,
    discount: 18,
    rating: 4.9,
    reviewCount: 356,
    link: '/store/6',
    category: 'accessories',
  },
  {
    id: '7',
    name: 'Apple Watch Series 9',
    nameVi: 'Apple Watch Series 9',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 9990000,
    rating: 4.7,
    reviewCount: 234,
    link: '/store/7',
    category: 'wearables',
  },
  {
    id: '8',
    name: 'Canon EOS R6',
    nameVi: 'Canon EOS R6',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    price: 49990000,
    originalPrice: 54990000,
    discount: 9,
    rating: 4.9,
    reviewCount: 167,
    link: '/store/8',
    category: 'cameras',
  },
];




