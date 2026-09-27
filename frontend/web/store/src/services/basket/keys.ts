import { FilterOptions } from '@services/types';
import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { AddToCartInput, GetBasketInput } from './input';

const createBasketKeys = createCacheKeyWithScope('_basket');

export const basketKeys = {
  getBasket: createCacheSection((input?: FilterOptions<GetBasketInput>) =>
    createBasketKeys(['getBasket', input])
  ),
  addToCart: createCacheSection((input?: FilterOptions<AddToCartInput>) =>
    createBasketKeys(['addToCart', input])
  ),
};
