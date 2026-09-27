import {
  createCacheKeyWithScope,
  createCacheSection,
} from '../factory/createCacheKeyFactory';
import { GetUserProfileInput } from './input';

const createUserKeys = createCacheKeyWithScope('_user');

export const userKeys = {
  // Aligned with useGetUserProfile hook
  get: createCacheSection((input?: GetUserProfileInput) =>
    createUserKeys(['get', input?.userName])
  ),
  // Aligned with useGetUserProfile hook (all profiles)
  all: createCacheSection(() =>
    createUserKeys(['all'])
  ),
};
