import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import type { GetUserProfileRequest } from './types';

const createUserKeys = createCacheKeyWithScope('_user');

export const userKeys = {
  get: createCacheSection((input?: GetUserProfileRequest) =>
    createUserKeys(['get', input?.userName])
  ),

  all: createUserKeys(['all']),
  detail: (userName?: string) => createUserKeys(['get', userName]),
};

