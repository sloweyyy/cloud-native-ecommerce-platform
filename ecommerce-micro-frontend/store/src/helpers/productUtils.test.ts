import {
  calculateDiscountPercentage,
  calculateAverageRating,
  getStockStatus,
  getDeliveryEstimate,
  isNewProduct,
  getProductStockStatus,
  isProductInStock,
  getProductQuantity,
  isProductLowStock,
} from './productUtils';
import { Product, Review, ProductStock } from '../services/products/types';

describe('productUtils', () => {
  describe('calculateDiscountPercentage', () => {
    it('calculates discount percentage correctly', () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(200, 150)).toBe(25);
      expect(calculateDiscountPercentage(50, 40)).toBe(20);
    });

    it('returns 0 when current price is greater than or equal to original', () => {
      expect(calculateDiscountPercentage(100, 100)).toBe(0);
      expect(calculateDiscountPercentage(100, 120)).toBe(0);
    });

    it('returns 0 for invalid prices', () => {
      expect(calculateDiscountPercentage(0, 50)).toBe(0);
      expect(calculateDiscountPercentage(50, 0)).toBe(0);
      expect(calculateDiscountPercentage(-10, 50)).toBe(0);
    });
  });

  describe('calculateAverageRating', () => {
    it('calculates average rating correctly', () => {
      const reviews: Review[] = [
        { reviewId: '1', userId: '1', userName: 'User1', rating: 5, date: '2024-01-01', comment: 'Great', helpfulCount: 0 },
        { reviewId: '2', userId: '2', userName: 'User2', rating: 4, date: '2024-01-02', comment: 'Good', helpfulCount: 0 },
        { reviewId: '3', userId: '3', userName: 'User3', rating: 3, date: '2024-01-03', comment: 'OK', helpfulCount: 0 },
      ];
      expect(calculateAverageRating(reviews)).toBe(4);
    });

    it('returns 0 for empty reviews array', () => {
      expect(calculateAverageRating([])).toBe(0);
    });

    it('handles single review', () => {
      const reviews: Review[] = [
        { reviewId: '1', userId: '1', userName: 'User1', rating: 5, date: '2024-01-01', comment: 'Great', helpfulCount: 0 },
      ];
      expect(calculateAverageRating(reviews)).toBe(5);
    });
  });

  describe('getStockStatus', () => {
    it('returns out-of-stock for zero quantity', () => {
      expect(getStockStatus(0)).toBe('out-of-stock');
    });

    it('returns low-stock when quantity is at or below threshold', () => {
      expect(getStockStatus(5, 10)).toBe('low-stock');
      expect(getStockStatus(10, 10)).toBe('low-stock');
    });

    it('returns in-stock when quantity is above threshold', () => {
      expect(getStockStatus(15, 10)).toBe('in-stock');
      expect(getStockStatus(100)).toBe('in-stock');
    });
  });

  describe('getDeliveryEstimate', () => {
    it('returns "Tomorrow" for next day delivery', () => {
      const today = new Date('2024-01-01');
      const result = getDeliveryEstimate(today, 1);
      expect(result).toBe('Tomorrow');
    });

    it('returns formatted date for future delivery', () => {
      const today = new Date('2024-01-01');
      const result = getDeliveryEstimate(today, 5);
      expect(result).toContain('January');
      expect(result).toContain('6');
    });
  });

  describe('isNewProduct', () => {
    it('returns true for product created within threshold', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);
      expect(isNewProduct(recentDate.toISOString(), 30)).toBe(true);
    });

    it('returns false for product created beyond threshold', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40);
      expect(isNewProduct(oldDate.toISOString(), 30)).toBe(false);
    });

    it('uses default 30 days threshold', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 20);
      expect(isNewProduct(recentDate.toISOString())).toBe(true);
    });
  });

  describe('getProductStockStatus', () => {
    it('returns stock status from product stock object', () => {
      const stock: ProductStock = {
        quantity: 5,
        inStock: true,
        lowStockThreshold: 10,
      };
      expect(getProductStockStatus(stock)).toBe('low-stock');
    });

    it('returns out-of-stock when stock is undefined', () => {
      expect(getProductStockStatus(undefined)).toBe('out-of-stock');
    });
  });

  describe('isProductInStock', () => {
    it('returns true when product is in stock', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
        stock: {
          quantity: 10,
          inStock: true,
        },
      };
      expect(isProductInStock(product)).toBe(true);
    });

    it('returns false when product is out of stock', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
        stock: {
          quantity: 0,
          inStock: false,
        },
      };
      expect(isProductInStock(product)).toBe(false);
    });
  });

  describe('getProductQuantity', () => {
    it('returns product quantity', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
        stock: {
          quantity: 25,
          inStock: true,
        },
      };
      expect(getProductQuantity(product)).toBe(25);
    });

    it('returns 0 when stock is undefined', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
      };
      expect(getProductQuantity(product)).toBe(0);
    });
  });

  describe('isProductLowStock', () => {
    it('returns true when product has low stock', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
        stock: {
          quantity: 5,
          inStock: true,
          lowStockThreshold: 10,
        },
      };
      expect(isProductLowStock(product)).toBe(true);
    });

    it('returns false when product has sufficient stock', () => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: 'Test',
        imageFile: 'test.png',
        price: 10,
        productType: 'Electronics',
        productBrand: 'Test',
        stock: {
          quantity: 20,
          inStock: true,
          lowStockThreshold: 10,
        },
      };
      expect(isProductLowStock(product)).toBe(false);
    });
  });
});




