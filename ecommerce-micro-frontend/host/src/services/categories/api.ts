import { axiosClient } from '../httpClient';
import { productTypesResponseSchema } from './schemas';
import { mapProductTypesToCategories } from './mappers';
import { ProductTypesResponse, Categories } from './types';

/**
 * Fetch all categories (product types)
 * 
 * Note: This API returns raw array (not wrapped in { data: ... })
 * so we use httpClient directly instead of createApiFactory
 */
export async function getAllCategories(): Promise<Categories> {
  const response = await axiosClient.get<ProductTypesResponse>('/Catalog/GetAllTypes');
  
  // Validate response with Zod schema
  const validatedData = productTypesResponseSchema.parse(response.data);
  
  // Transform to frontend format
  return mapProductTypesToCategories(validatedData);
}
