import { ProductTypeResponse, Category } from './types';

/**
 * Icon mapping based on category name
 */
function getCategoryIcon(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('laptop')) return '💻';
  if (lowerName.includes('phone') || lowerName.includes('smartphone')) return '📱';
  if (lowerName.includes('tablet')) return '📱';
  if (lowerName.includes('audio') || lowerName.includes('headphone')) return '🎧';
  if (lowerName.includes('keyboard') || lowerName.includes('mouse') || lowerName.includes('mice')) return '⌨️';
  if (lowerName.includes('gaming')) return '🎮';
  if (lowerName.includes('watch') || lowerName.includes('wearable')) return '⌚';
  if (lowerName.includes('camera')) return '📷';
  if (lowerName.includes('monitor') || lowerName.includes('display')) return '🖥️';
  return '📦';
}

/**
 * Image mapping based on category name
 */
function getCategoryImage(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('laptop'))
    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('keyboard'))
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('mouse') || lowerName.includes('mice'))
    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('monitor') || lowerName.includes('display'))
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  if (lowerName.includes('gaming'))
    return 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
}

/**
 * Transform backend ProductType to frontend Category
 */
export function mapProductTypeToCategory(productType: ProductTypeResponse): Category {
  return {
    id: productType.id,
    name: productType.name,
    nameVi: productType.name, // TODO: Add Vietnamese translations
    icon: getCategoryIcon(productType.name),
    path: `/store?typeId=${productType.id}`,
    imageUrl: getCategoryImage(productType.name),
  };
}

/**
 * Transform array of backend ProductTypes to frontend Categories
 */
export function mapProductTypesToCategories(productTypes: ProductTypeResponse[]): Category[] {
  return productTypes.map(mapProductTypeToCategory);
}

