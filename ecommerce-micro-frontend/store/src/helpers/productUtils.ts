import { Product, Review, StockStatus } from '../services/products';

/**
 * Type definition for product stock (matching backend response structure)
 */
export type ProductStock = {
  quantity: number;
  inStock: boolean;
  lowStockThreshold?: number;
};

/**
 * Calculate average rating from reviews
 *
 * @param reviews - Array of reviews
 * @returns Average rating (0-5)
 *
 * @example
 * calculateAverageRating([{ rating: 5 }, { rating: 4 }]) // 4.5
 */
export function calculateAverageRating(reviews: Review[]): number {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round(sum / reviews.length);
}

/**
 * Get stock status based on quantity and threshold
 *
 * @param quantity - Current stock quantity
 * @param threshold - Low stock threshold (default: 10)
 * @returns Stock status
 *
 * @example
 * getStockStatus(0) // 'out-of-stock'
 * getStockStatus(5, 10) // 'low-stock'
 * getStockStatus(20) // 'in-stock'
 */
export function getStockStatus(
  quantity: number,
  threshold = 10
): StockStatus {
  if (quantity === 0) {
    return 'out-of-stock';
  }
  if (quantity <= threshold) {
    return 'low-stock';
  }
  return 'in-stock';
}

/**
 * Calculate delivery estimate
 *
 * @param currentDate - Starting date
 * @param estimatedDays - Number of days for delivery
 * @returns Estimated delivery date string
 *
 * @example
 * getDeliveryEstimate(new Date('2024-01-01'), 1) // 'Tomorrow'
 * getDeliveryEstimate(new Date('2024-01-01'), 5) // 'January 6, 2024'
 */
export function getDeliveryEstimate(
  currentDate: Date,
  estimatedDays: number
): string {
  if (estimatedDays === 1) {
    return 'Tomorrow';
  }
  
  const deliveryDate = new Date(currentDate);
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  
  return deliveryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if product is new (created within threshold days)
 *
 * @param createdAt - ISO date string of when product was created
 * @param thresholdDays - Number of days to consider "new" (default: 30)
 * @returns True if product is new
 *
 * @example
 * isNewProduct('2024-01-01', 30) // depends on current date
 */
export function isNewProduct(
  createdAt: string,
  thresholdDays = 30
): boolean {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= thresholdDays;
}

/**
 * Get stock status from ProductStock object
 *
 * @param stock - Product stock object
 * @returns Stock status
 *
 * @example
 * getProductStockStatus({ quantity: 5, inStock: true, lowStockThreshold: 10 })
 * // 'low-stock'
 */
export function getProductStockStatus(stock?: ProductStock): StockStatus {
  if (!stock) {
    return 'out-of-stock';
  }
  return getStockStatus(stock.quantity, stock.lowStockThreshold);
}

/**
 * Check if product has low stock
 *
 * @param product - The product to check (supports both flattened and nested stock)
 * @returns True if product has low stock
 *
 * @example
 * isProductLowStock({ stockQuantity: 5, stockLowStockThreshold: 10 }) // true
 * isProductLowStock({ stock: { quantity: 5, inStock: true, lowStockThreshold: 10 } }) // true
 */
export function isProductLowStock(
  product: Product & { stock?: ProductStock }
): boolean {
  // Check nested stock object first (from tests/backend)
  if (product.stock && product.stock.lowStockThreshold !== undefined) {
    return (
      product.stock.quantity > 0 &&
      product.stock.quantity <= product.stock.lowStockThreshold
    );
  }
  
  // Check flattened properties (from frontend DTO)
  if (!product.stockQuantity || !product.stockLowStockThreshold) {
    return false;
  }
  return (
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.stockLowStockThreshold
  );
}

/**
 * Calculate discount badge information for a product
 *
 * @param product - The product to calculate discount for
 * @returns Badge info or undefined if no discount
 *
 * @example
 * calculateDiscountBadge({ price: 80, originalPrice: 100, hasDiscount: true })
 * // { text: '-20%', type: 'discount' }
 */
export function calculateDiscountBadge(product: {
  hasDiscount?: boolean;
  price: number;
  originalPrice?: number;
}): { text: string; type: 'discount' } | undefined {
  if (
    product.hasDiscount &&
    product.originalPrice &&
    product.originalPrice > product.price
  ) {
    const discountPercentage = Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
    return {
      text: `-${discountPercentage}%`,
      type: 'discount',
    };
  }
  return undefined;
}

/**
 * Calculate the actual discount amount
 *
 * @param product - The product to calculate discount for
 * @returns Discount amount or 0 if no discount
 *
 * @example
 * calculateDiscountAmount({ price: 80, originalPrice: 100 }) // 20
 */
export function calculateDiscountAmount(product: {
  price: number;
  originalPrice?: number;
}): number {
  if (product.originalPrice && product.originalPrice > product.price) {
    return product.originalPrice - product.price;
  }
  return 0;
}

/**
 * Calculate the discount percentage
 *
 * @param originalPrice - Original price
 * @param currentPrice - Current/discounted price
 * @returns Discount percentage (0-100)
 *
 * @example
 * calculateDiscountPercentage(100, 80) // 20
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0 || currentPrice <= 0 || currentPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * Get the primary image URL for a product
 * Prioritizes imageFile, falls back to first image in images array
 *
 * @param product - The product to get image from
 * @returns Image URL or undefined
 *
 * @example
 * getProductImageUrl({ imageFile: 'main.jpg', images: ['alt1.jpg'] }) // 'main.jpg'
 */
export function getProductImageUrl(
  product: Pick<Product, 'imageFile' | 'images'>
): string | undefined {
  if (product.imageFile) {
    return product.imageFile;
  }
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return undefined;
}

/**
 * Check if a product is in stock
 *
 * @param product - The product to check (supports both flattened and nested stock properties)
 * @returns True if product is in stock
 *
 * @example
 * isProductInStock({ stockInStock: true }) // true
 * isProductInStock({ stock: { inStock: true, quantity: 10 } }) // true
 */
export function isProductInStock(
  product: Pick<Product, 'stockInStock' | 'stockQuantity'> & { stock?: ProductStock }
): boolean {
  // Check nested stock object first (from tests/backend)
  if (product.stock) {
    return product.stock.inStock;
  }
  
  // Check flattened properties (from frontend DTO)
  if (product.stockInStock !== undefined) {
    return product.stockInStock;
  }
  if (product.stockQuantity !== undefined) {
    return product.stockQuantity > 0;
  }
  
  // Return false for safety when no stock info available
  return false;
}

/**
 * Check if product has rating information
 *
 * @param product - The product to check
 * @returns True if product has rating data
 *
 * @example
 * hasRating({ ratingAverage: 4.5, ratingCount: 10 }) // true
 */
export function hasRating(
  product: Pick<Product, 'ratingAverage' | 'ratingCount'>
): boolean {
  return (
    product.ratingAverage !== undefined && product.ratingCount !== undefined
  );
}

/**
 * Get stock status display information for UI
 *
 * @param product - The product to get status for (supports both flattened and nested stock)
 * @returns Stock status config with label and color
 *
 * @example
 * getStockStatusDisplay({ stockStatus: 'in-stock' })
 * // { label: 'In Stock', color: 'green' }
 */
export function getStockStatusDisplay(
  product: Pick<Product, 'stockStatus' | 'stockInStock' | 'stockQuantity'> & { stock?: ProductStock }
): {
  label: string;
  color: string;
} {
  if (product.stockStatus) {
    switch (product.stockStatus) {
      case 'in-stock':
        return { label: 'In Stock', color: 'green' };
      case 'low-stock':
        return { label: 'Low Stock', color: 'orange' };
      case 'out-of-stock':
        return { label: 'Out of Stock', color: 'red' };
    }
  }

  // Fallback to isProductInStock (handles both patterns)
  if (!isProductInStock(product)) {
    return { label: 'Out of Stock', color: 'red' };
  }

  const quantity = getProductQuantity(product);
  if (quantity < 10) {
    return { label: 'Low Stock', color: 'orange' };
  }

  return { label: 'In Stock', color: 'green' };
}

/**
 * Get product available quantity
 *
 * @param product - The product to get quantity from (supports both flattened and nested stock)
 * @returns Available quantity (defaults to 0 if not specified)
 *
 * @example
 * getProductQuantity({ stockQuantity: 5 }) // 5
 * getProductQuantity({ stock: { quantity: 25, inStock: true } }) // 25
 * getProductQuantity({}) // 0
 */
export function getProductQuantity(
  product: Pick<Product, 'stockQuantity'> & { stock?: ProductStock }
): number {
  // Check nested stock object first (from tests/backend)
  if (product.stock) {
    return product.stock.quantity;
  }
  
  // Check flattened property (from frontend DTO)
  return product.stockQuantity ?? 0;
}
