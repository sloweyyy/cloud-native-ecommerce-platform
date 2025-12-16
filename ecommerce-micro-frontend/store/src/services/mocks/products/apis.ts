import MockAdapter from 'axios-mock-adapter';
import { createEndpoint, createResponse } from '../utils';
import { mockProducts, mockBrands, mockTypes } from './data';
import type {
  ProductResponse,
  ProductDetailResponse,
  ProductDetailWithReviewsResponse,
  ReviewResponse,
  BrandResponse,
  ProductTypeResponse,
} from '../../products/types';

const ENDPOINT = '/api/v1/mock/Catalog';

// Pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Sorting constants
const SORT_PRICE_ASC = 'priceAsc';
const SORT_PRICE_DESC = 'priceDesc';
const SORT_NAME_ASC = 'nameAsc';
const SORT_NAME_DESC = 'nameDesc';

/**
 * Normalize request parameters to handle case variations
 *
 * @param params - Raw request parameters
 * @returns Normalized parameters with consistent casing
 */
function normalizeParams(params: Record<string, any>) {
  return {
    page: params.PageIndex || params.page || params.Page,
    limit: params.PageSize || params.limit || params.Limit,
    brandId: params.BrandId || params.brandId,
    typeId: params.TypeId || params.typeId,
    search: params.Search || params.search,
    sort: params.Sort || params.sort,
  };
}

/**
 * Transform internal Product format to API ProductResponse format
 *
 * Maps flattened frontend product structure to the nested backend API structure.
 * This includes resolving brand and type references and generating a summary.
 *
 * @param product - Internal product data with flattened structure
 * @returns API-compatible product response with nested Brand and Type objects
 */
function transformProductToResponse(
  product: (typeof mockProducts)[0]
): ProductResponse {
  const brand = mockBrands.find((b) => b.name === product.productBrand);
  const type = mockTypes.find((t) => t.name === product.productType);

  const summary =
    product.description.length > 100
      ? product.description.substring(0, 100) + '...'
      : product.description || product.name;

  return {
    id: product.id,
    name: product.name,
    summary: summary,
    description: product.description || product.name,
    imageFile: product.imageFile,
    brands: brand
      ? {
          id: brand.id,
          name: brand.name,
        }
      : {
          id: '',
          name: product.productBrand,
        },
    types: type
      ? {
          id: type.id,
          name: type.name,
        }
      : {
          id: '',
          name: product.productType,
        },
    price: product.price,
  };
}

/**
 * Transform internal Product format to API ProductDetailResponse format
 *
 * Builds detailed product response including Stock, Rating, Shipping, and Meta objects
 * from the flattened frontend structure. Used for product detail endpoints.
 *
 * @param product - Internal product data with flattened structure
 * @returns API-compatible detailed product response with nested objects
 */
function transformProductDetailToResponse(
  product: (typeof mockProducts)[0]
): ProductDetailResponse {
  const baseResponse = transformProductToResponse(product);

  // Build Stock object from flattened fields
  let Stock = undefined;
  if (product.stockQuantity !== undefined) {
    Stock = {
      quantity: product.stockQuantity,
      inStock: product.stockInStock ?? false,
      lowStockThreshold: product.stockLowStockThreshold,
    };
  }

  // Build Rating object from flattened fields
  let Rating = undefined;
  if (product.ratingAverage !== undefined) {
    Rating = {
      average: product.ratingAverage,
      count: product.ratingCount ?? 0,
      distribution: product.ratingDistribution ?? {},
    };
  }

  // Build Shipping object from flattened fields
  let Shipping = undefined;
  if (
    product.shippingFreeShipping !== undefined ||
    product.shippingEstimatedDeliveryDays !== undefined ||
    product.shippingCost !== undefined
  ) {
    Shipping = {
      freeShipping: product.shippingFreeShipping,
      estimatedDeliveryDays: product.shippingEstimatedDeliveryDays,
      shippingCost: product.shippingCost,
    };
  }

  // Build Meta object from flattened fields
  let Meta = undefined;
  if (product.metaTitle || product.metaDescription || product.metaKeywords) {
    Meta = {
      title: product.metaTitle,
      description: product.metaDescription,
      keywords: product.metaKeywords ?? [],
    };
  }

  return {
    ...baseResponse,
    images: product.images ?? [],
    features: product.features ?? [],
    specifications: product.specifications ?? {},
    stock: Stock,
    rating: Rating,
    shipping: Shipping,
    relatedProductIds: product.relatedProductIds ?? [],
    meta: Meta,
  };
}

/**
 * Transform internal Product format to API ProductDetailWithReviewsResponse format
 *
 * Extends product detail response with reviews array. Used for endpoints that return
 * both product details and customer reviews.
 *
 * @param product - Internal product data with flattened structure
 * @returns API-compatible product response with details and reviews
 */
function transformProductDetailWithReviewsToResponse(
  product: (typeof mockProducts)[0]
): ProductDetailWithReviewsResponse {
  const baseResponse = transformProductDetailToResponse(product);

  const reviews: ReviewResponse[] =
    product.reviews?.map((review) => ({
      reviewId: review.reviewId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      date: review.date,
      comment: review.comment,
      helpfulCount: review.helpfulCount,
    })) ?? [];

  return {
    ...baseResponse,
    reviews: reviews,
  };
}

/**
 * Transform internal Brand format to API BrandResponse format
 *
 * Simple transformation mapping brand ID and name to API format.
 *
 * @param brand - Internal brand data
 * @returns API-compatible brand response
 */
function transformBrandToResponse(
  brand: (typeof mockBrands)[0]
): BrandResponse {
  return {
    id: brand.id,
    name: brand.name,
  };
}

/**
 * Transform internal ProductType format to API ProductTypeResponse format
 *
 * Simple transformation mapping product type ID and name to API format.
 *
 * @param type - Internal product type data
 * @returns API-compatible product type response
 */
function transformProductTypeToResponse(
  type: (typeof mockTypes)[0]
): ProductTypeResponse {
  return {
    id: type.id,
    name: type.name,
  };
}

export default function register(mockAdapter: MockAdapter) {
  // GET /Catalog/GetAllProducts with pagination and filtering
  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllProducts`))
    .reply((config) => {
      const rawParams = config.params || {};
      const params = normalizeParams(rawParams);

      const page = parseInt(params.page || String(DEFAULT_PAGE)) || DEFAULT_PAGE;
      const limit =
        parseInt(params.limit || String(DEFAULT_LIMIT)) || DEFAULT_LIMIT;

      let filtered = [...mockProducts];

      if (params.brandId) {
        const brandName = mockBrands.find((b) => b.id === params.brandId)?.name;
        if (brandName) {
          filtered = filtered.filter((p) => p.productBrand === brandName);
        }
      }

      if (params.typeId) {
        const typeName = mockTypes.find((t) => t.id === params.typeId)?.name;
        if (typeName) {
          filtered = filtered.filter((p) => p.productType === typeName);
        }
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }

      if (params.sort) {
        switch (params.sort) {
          case SORT_PRICE_ASC:
            filtered.sort((a, b) => a.price - b.price);
            break;
          case SORT_PRICE_DESC:
            filtered.sort((a, b) => b.price - a.price);
            break;
          case SORT_NAME_ASC:
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case SORT_NAME_DESC:
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        }
      }

      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return [
        200,
        createResponse({
          pageIndex: page,
          pageSize: limit,
          count: filtered.length,
          data: paginatedData.map(transformProductToResponse),
        }),
      ];
    });

  mockAdapter
    .onGet(new RegExp(`${ENDPOINT}/GetProductById/([^/]+)`))
    .reply((config) => {
      // Extract ID from URL using regex capture group
      const match = config.url?.match(/GetProductById\/([^/]+)$/);
      const id = match?.[1];

      if (!id) {
        return [
          400,
          createResponse({ error: 'Product ID is required in URL path' }),
        ];
      }

      const product = mockProducts.find((p) => p.id === id);
      if (!product) {
        return [
          404,
          createResponse({ error: `Product not found with ID: ${id}` }),
        ];
      }

      // Return product detail with reviews for GetProductById
      return [
        200,
        createResponse(transformProductDetailWithReviewsToResponse(product)),
      ];
    });

  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllBrands`))
    .reply(200, createResponse(mockBrands.map(transformBrandToResponse)));

  mockAdapter
    .onGet(createEndpoint(`${ENDPOINT}/GetAllTypes`))
    .reply(200, createResponse(mockTypes.map(transformProductTypeToResponse)));
}
