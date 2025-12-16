import { z } from 'zod';

export const stockStatusEnum = z.enum([
  'in-stock',
  'low-stock',
  'out-of-stock',
]);

export const brandResponseSchema = z.object({  id: z.string(),
  name: z.string(),
});

export const productTypeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
});

export const productsResponseSchema = z.object({
  pageIndex: z.number().nonnegative(),
  pageSize: z.number().positive(),
  count: z.number().nonnegative(),
  data: z.array(productResponseSchema),
});

export const reviewResponseSchema = z.object({
  reviewId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(), // ISO date string
  comment: z.string(),
  helpfulCount: z.number().nonnegative().optional(),
});

export const reviewsResponseSchema = z.array(reviewResponseSchema);

export const productDetailResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),

  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),

  stock: z
    .object({
      quantity: z.number().nonnegative(),
      inStock: z.boolean(),
      lowStockThreshold: z.number().nonnegative().optional(),
    })
    .optional(),

  rating: z
    .object({
      average: z.number().min(0).max(5),
      count: z.number().nonnegative(),
      distribution: z.record(z.number()).optional(),
    })
    .optional(),

  shipping: z
    .object({
      freeShipping: z.boolean().optional(),
      estimatedDeliveryDays: z.number().positive().optional(),
      shippingCost: z.number().nonnegative().optional(),
    })
    .optional(),

  relatedProductIds: z.array(z.string()).optional(),

  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export const productDetailWithReviewsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  imageFile: z.string(),
  brands: brandResponseSchema,
  types: productTypeResponseSchema,
  price: z.number().nonnegative(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  stock: z
    .object({
      quantity: z.number().nonnegative(),
      inStock: z.boolean(),
      lowStockThreshold: z.number().nonnegative().optional(),
    })
    .optional(),
  rating: z
    .object({
      average: z.number().min(0).max(5),
      count: z.number().nonnegative(),
      distribution: z.record(z.number()).optional(),
    })
    .optional(),
  shipping: z
    .object({
      freeShipping: z.boolean().optional(),
      estimatedDeliveryDays: z.number().positive().optional(),
      shippingCost: z.number().nonnegative().optional(),
    })
    .optional(),
  relatedProductIds: z.array(z.string()).optional(),
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),

  // Additional field for reviews
  reviews: z.array(reviewResponseSchema).optional(),
});

export const reviewSchema = z.object({
  reviewId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string(),
  helpfulCount: z.number().nonnegative().default(0),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  imageFile: z.string(),
  price: z.number().nonnegative(),
  productType: z.string(),
  productBrand: z.string(),

  originalPrice: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  hasDiscount: z.boolean().default(false),

  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),

  stockQuantity: z.number().nonnegative().optional(),
  stockInStock: z.boolean().optional(),
  stockLowStockThreshold: z.number().nonnegative().optional(),
  stockStatus: stockStatusEnum.optional(),

  ratingAverage: z.number().min(0).max(5).optional(),
  ratingCount: z.number().nonnegative().optional(),
  ratingDistribution: z.record(z.number()).optional(),

  shippingFreeShipping: z.boolean().default(false),
  shippingEstimatedDeliveryDays: z.number().positive().optional(),
  shippingCost: z.number().nonnegative().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).default([]),

  relatedProductIds: z.array(z.string()).default([]),
  reviews: z.array(reviewSchema).default([]),
});

export const productArraySchema = z.array(productSchema);

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const brandArraySchema = z.array(brandSchema);

export const brandArrayResponseSchema = z.array(brandResponseSchema);

export const productTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const productTypeArraySchema = z.array(productTypeSchema);

export const productTypeArrayResponseSchema = z.array(
  productTypeResponseSchema
);
