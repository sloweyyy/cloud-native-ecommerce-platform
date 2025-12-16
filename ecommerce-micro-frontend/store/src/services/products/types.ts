import { z } from 'zod';
import {
  stockStatusEnum,
  brandResponseSchema,
  productTypeResponseSchema,
  productResponseSchema,
  productsResponseSchema,
  productDetailResponseSchema,
  productDetailWithReviewsResponseSchema,
  reviewResponseSchema,
  reviewsResponseSchema,
  productSchema,
  brandSchema,
  productTypeSchema,
  reviewSchema,
  productArraySchema,
  brandArraySchema,
  productTypeArraySchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
} from './schemas';

export type StockStatus = z.infer<typeof stockStatusEnum>;

export type BrandResponse = z.infer<typeof brandResponseSchema>;
export type ProductTypeResponse = z.infer<typeof productTypeResponseSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsResponse = z.infer<typeof productsResponseSchema>;
export type ProductDetailResponse = z.infer<typeof productDetailResponseSchema>;
export type ProductDetailWithReviewsResponse = z.infer<
  typeof productDetailWithReviewsResponseSchema
>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
export type ReviewsResponse = z.infer<typeof reviewsResponseSchema>;

export type Product = z.infer<typeof productSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type ProductType = z.infer<typeof productTypeSchema>;
export type Review = z.infer<typeof reviewSchema>;

// Paginated product list with metadata
export type PaginatedProducts = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Product[];
};

export type ProductArray = z.infer<typeof productArraySchema>;
export type BrandArray = z.infer<typeof brandArraySchema>;
export type ProductTypeArray = z.infer<typeof productTypeArraySchema>;
export type BrandResponseArray = z.infer<typeof brandArrayResponseSchema>;
export type ProductTypeResponseArray = z.infer<
  typeof productTypeArrayResponseSchema
>;
