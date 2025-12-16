import { createMapper } from '../factory/createMapper';
import {
  Product,
  ProductResponse,
  ProductsResponse,
  ProductDetailResponse,
  ReviewResponse,
  ReviewsResponse,
  Review,
  Brand,
  BrandResponse,
  ProductType,
  ProductTypeResponse,
} from './types';
import {
  productResponseSchema,
  productsResponseSchema,
  productDetailResponseSchema,
  reviewResponseSchema,
  brandResponseSchema,
  productTypeResponseSchema,
  brandArrayResponseSchema,
  productTypeArrayResponseSchema,
  productSchema,
  reviewSchema,
} from './schemas';

export const productMapper = createMapper<ProductResponse, Product>(
  (response) => {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      imageFile: response.imageFile,
      price: response.price,
      productType: response.types?.id ?? '',
      productBrand: response.brands?.id ?? '',
      // Default values for optional fields (schema will handle these)
      images: [],
      features: [],
      specifications: {},
      hasDiscount: false,
      shippingFreeShipping: false,
      metaKeywords: [],
      relatedProductIds: [],
      reviews: [],
    };
  },
  productResponseSchema
);

export const productsMapper = createMapper<ProductsResponse, import('./types').PaginatedProducts>(
  (response) => {
    return {
      pageIndex: response.pageIndex,
      pageSize: response.pageSize,
      count: response.count,
      data: response.data.map((productResponse) =>
        productMapper.toDto(productResponse)
      ).filter((product): product is Product => product !== null),
    };
  },
  productsResponseSchema
);

export const brandMapper = createMapper<BrandResponse, Brand>((response) => {
  return {
    id: response.id,
    name: response.name,
  };
}, brandResponseSchema);

export const brandArrayMapper = createMapper<BrandResponse[], Brand[]>(
  (response) => {
    return response
      .map((brandResponse) => brandMapper.toDto(brandResponse))
      .filter((brand): brand is Brand => brand !== null);
  },
  brandArrayResponseSchema
);

export const productTypeMapper = createMapper<ProductTypeResponse, ProductType>(
  (response) => {
    return {
      id: response.id,
      name: response.name,
    };
  },
  productTypeResponseSchema
);

export const productTypeArrayMapper = createMapper<
  ProductTypeResponse[],
  ProductType[]
>((response) => {
  return response
    .map((typeResponse) => productTypeMapper.toDto(typeResponse))
    .filter((type): type is ProductType => type !== null);
}, productTypeArrayResponseSchema);

export const reviewMapper = createMapper<ReviewResponse, Review>((response) => {
  return {
    reviewId: response.reviewId,
    userId: response.userId,
    userName: response.userName,
    rating: response.rating,
    date: response.date,
    comment: response.comment,
    helpfulCount: response.helpfulCount ?? 0,
  };
}, reviewResponseSchema);

export const reviewsMapper = (reviews: ReviewsResponse): Review[] => {
  return reviews
    .map((review) => reviewMapper.toDto(review))
    .filter((review): review is Review => review !== null);
};

export const productDetailMapper = createMapper<ProductDetailResponse, Product>(
  (response) => {
    // Compute stock status
    let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | undefined;
    if (response.stock) {
      if (!response.stock.inStock) {
        stockStatus = 'out-of-stock';
      } else if (
        response.stock.lowStockThreshold &&
        response.stock.quantity <= response.stock.lowStockThreshold
      ) {
        stockStatus = 'low-stock';
      } else {
        stockStatus = 'in-stock';
      }
    }

    return {
      id: response.id,
      name: response.name,
      description: response.description,
      imageFile: response.imageFile,
      price: response.price,
      productType: response.types?.id ?? '',
      productBrand: response.brands?.id ?? '',
      // Detail fields
      images: response.images ?? [],
      features: response.features ?? [],
      specifications: response.specifications ?? {},
      // Stock fields
      stockQuantity: response.stock?.quantity,
      stockInStock: response.stock?.inStock,
      stockLowStockThreshold: response.stock?.lowStockThreshold,
      stockStatus,
      // Rating fields
      ratingAverage: response.rating?.average,
      ratingCount: response.rating?.count,
      ratingDistribution: response.rating?.distribution,
      // Shipping fields
      shippingFreeShipping: response.shipping?.freeShipping ?? false,
      shippingEstimatedDeliveryDays: response.shipping?.estimatedDeliveryDays,
      shippingCost: response.shipping?.shippingCost,
      // Meta fields
      metaTitle: response.meta?.title,
      metaDescription: response.meta?.description,
      metaKeywords: response.meta?.keywords ?? [],
      // Related products
      relatedProductIds: response.relatedProductIds ?? [],
      // Defaults for other optional fields
      hasDiscount: false,
      reviews: [],
    };
  },
  productDetailResponseSchema
);
