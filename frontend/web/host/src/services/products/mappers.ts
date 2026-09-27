import { ProductResponse, ProductsResponse, Product } from './types';

export function mapProductResponseToProduct(response: ProductResponse): Product {
  return {
    id: response.id,
    name: response.name,
    summary: response.summary,
    description: response.description,
    imageFile: response.imageFile,
    price: response.price,
    productType: response.types.name,
    productBrand: response.brands.name,
    imageUrl: response.imageFile,
    ratingAverage: undefined,
    ratingCount: undefined,
  };
}

export function mapProductsResponseToProducts(
  response: ProductsResponse
): Product[] {
  return response.data.map(mapProductResponseToProduct);
}

