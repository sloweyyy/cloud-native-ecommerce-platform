export interface FlashSaleProduct {
  id: string;
  name: string;
  nameVi: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  link: string;
}

export const flashSaleProducts: FlashSaleProduct[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    nameVi: 'Tai nghe không dây',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 299000,
    salePrice: 199000,
    discount: 33,
    rating: 4.5,
    reviewCount: 128,
    link: '/store/1',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    nameVi: 'Bàn phím cơ',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 899000,
    salePrice: 599000,
    discount: 33,
    rating: 4.8,
    reviewCount: 256,
    link: '/store/2',
  },
  {
    id: '3',
    name: 'Gaming Mouse',
    nameVi: 'Chuột gaming',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 499000,
    salePrice: 299000,
    discount: 40,
    rating: 4.6,
    reviewCount: 189,
    link: '/store/3',
  },
  {
    id: '4',
    name: 'USB-C Hub',
    nameVi: 'Hub USB-C',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 399000,
    salePrice: 249000,
    discount: 38,
    rating: 4.4,
    reviewCount: 95,
    link: '/store/4',
  },
  {
    id: '5',
    name: 'Wireless Charger',
    nameVi: 'Sạc không dây',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 299000,
    salePrice: 179000,
    discount: 40,
    rating: 4.3,
    reviewCount: 142,
    link: '/store/5',
  },
  {
    id: '6',
    name: 'Laptop Stand',
    nameVi: 'Giá đỡ laptop',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    originalPrice: 599000,
    salePrice: 399000,
    discount: 33,
    rating: 4.7,
    reviewCount: 203,
    link: '/store/6',
  },
];




