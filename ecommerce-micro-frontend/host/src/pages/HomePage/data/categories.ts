export interface Category {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  path: string;
  imageUrl?: string;
}

// Default fallback categories (will be replaced with API data)
export const categories: Category[] = [
  {
    id: 'laptops',
    name: 'Laptops',
    nameVi: 'Laptop',
    icon: '💻',
    path: '/store?cat=laptops',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];




