import { createApiFactory } from '../factory/createApiFactory';
import { RequestParamsRequired } from '../types';

import { getBasketInput, GetBasketInput, AddToCartInput } from './input';
import { basketMapper } from './mappers';
import { BasketResponse, basketResponseSchema } from './schemas';

export const apiFactory = createApiFactory('/Basket', { version: '' });

export async function getBasket(
  request?: RequestParamsRequired<GetBasketInput>
) {
  console.log('getBasket', request);
  return apiFactory<BasketResponse>('GET', `/GetBasket/:userName`, request, {
    transformer: basketMapper.toDto,
    paramsSchema: getBasketInput,
    responseSchema: basketResponseSchema,
    useMock: request?.params?.useMock ?? false,
  });
}

export async function addToCart(request: {
  payload: AddToCartInput;
  params?: { useMock?: boolean };
}) {
  return apiFactory<BasketResponse>('POST', '/CreateBasket', request, {
    transformer: basketMapper.toDto,
    responseSchema: basketResponseSchema,
    useMock: request?.params?.useMock ?? false,
  });
}
