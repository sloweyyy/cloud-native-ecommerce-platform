import { createApiFactory } from '../factory/createApiFactory';
import { RequestParamsRequired } from '../types';
import { axiosClient } from '../httpClient';
import { API_CONFIG } from '../../config';

import {
  getBasketInput,
  GetBasketInput,
  AddToCartInput,
  UpdateBasketItemInput,
  RemoveBasketItemInput,
  CheckoutInput,
} from './input';
import { basketMapper } from './mappers';
import {
  BasketResponse,
  basketResponseSchema,
  Basket,
  BasketItem,
} from './schemas';

export const apiFactory = createApiFactory('/Basket', { version: '' });

export async function getBasket(
  request?: RequestParamsRequired<GetBasketInput>
) {
  console.log('[checkout] getBasket', request);
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

export async function updateBasketItem(request: {
  payload: UpdateBasketItemInput & { userName?: string };
  currentBasket?: Basket | null;
}): Promise<{ data: Basket } | null> {
  const userName = request.payload.userName || 'guest';
  const currentItems = request.currentBasket?.items || [];

  const updatedItems = currentItems
    .map((item) => {
      if (item.productId === request.payload.productId) {
        if (request.payload.quantity <= 0) {
          return null;
        }
        return { ...item, quantity: request.payload.quantity };
      }
      return item;
    })
    .filter((item): item is BasketItem => item !== null);

  const command: AddToCartInput = {
    UserName: userName,
    Items: updatedItems.map((item) => ({
      Quantity: item.quantity,
      Price: item.price,
      OriginalPrice: item.originalPrice,
      DiscountAmount: item.discountAmount,
      ProductId: item.productId,
      ImageFile: item.imageFile || undefined,
      ProductName: item.productName,
    })),
  };

  const response = await apiFactory<BasketResponse>(
    'POST',
    '/CreateBasket',
    {
      payload: command,
      params: { useMock: false },
    },
    {
      transformer: basketMapper.toDto,
      responseSchema: basketResponseSchema,
    }
  );

  if (!response) {
    return null;
  }

  const basketData: Basket = {
    ...(response as Basket),
    items: (response as Basket).items || [],
  };

  return { data: basketData };
}

export async function removeBasketItem(request: {
  payload: RemoveBasketItemInput & { userName?: string };
  currentBasket?: Basket | null;
}): Promise<{ data: Basket } | null> {
  return updateBasketItem({
    payload: {
      productId: request.payload.productId,
      quantity: 0,
      userName: request.payload.userName,
    },
    currentBasket: request.currentBasket,
  });
}

export async function checkout(request: {
  payload: CheckoutInput & { userName?: string };
}) {
  const userName = request.payload.userName || 'guest';
  const url = API_CONFIG.BASKET.CHECKOUT;

  const payload = {
    UserName: userName,
    TotalPrice: request.payload.totalPrice,
  };

  const response = await axiosClient.post(url, payload);

  return {
    success: true,
    orderId: response.data?.orderId,
  };
}
