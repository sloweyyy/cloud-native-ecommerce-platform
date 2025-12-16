import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactQueryOptions } from '../types';
import * as apis from './apis';
import { userKeys } from './keys';
import type {
  GetUserProfileRequest,
  UpdateUserProfileRequest,
  User,
} from './types';

// ====================================
// QUERY HOOKS (READ OPERATIONS)
// ====================================

/**
 * Get user profile for current user
 */
export function useGetUserProfile(
  input?: GetUserProfileRequest,
  options?: ReactQueryOptions
) {
  const { enabled = true } = options || {};

  return useQuery<{ data: User } | null>({
    queryKey: userKeys.get.create(input),
    queryFn: async () => {
      const result = await apis.getUserProfile({
        params: input,
      });
      return result ?? null;
    },
    enabled: Boolean(enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// ====================================
// MUTATION HOOKS (WRITE OPERATIONS)
// ====================================

/**
 * Update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<{ data: User } | null, Error, UpdateUserProfileRequest>({
    mutationFn: async (input) => {
      const result = await apis.updateUserProfile({
        payload: input,
      });
      return result ?? null;
    },
    onSuccess: () => {
      // Invalidate user profile cache
      queryClient.invalidateQueries({
        queryKey: [userKeys.all],
      });
    },
  });
}

