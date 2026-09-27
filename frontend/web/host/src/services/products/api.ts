import { axiosClient } from '../httpClient';
import { productsResponseSchema } from './schemas';
import { mapProductsResponseToProducts } from './mappers';
import { ProductsResponse, Product, ProductsParams } from './types';

export async function getProducts(
  params?: ProductsParams
): Promise<Product[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.PageIndex) {
    queryParams.append('PageIndex', params.PageIndex.toString());
  }
  if (params?.PageSize) {
    queryParams.append('PageSize', params.PageSize.toString());
  }
  if (params?.BrandId) {
    queryParams.append('BrandId', params.BrandId);
  }
  if (params?.TypeId) {
    queryParams.append('TypeId', params.TypeId);
  }
  if (params?.Search) {
    queryParams.append('Search', params.Search);
  }
  if (params?.Sort) {
    queryParams.append('Sort', params.Sort);
  }

  const url = `/Catalog/GetAllProducts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await axiosClient.get<ProductsResponse>(url);

  const validatedData = productsResponseSchema.parse(response.data);

  return mapProductsResponseToProducts(validatedData);
}

