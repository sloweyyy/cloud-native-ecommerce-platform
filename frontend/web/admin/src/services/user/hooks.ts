import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@ecommerce-platform/auth-provider';
import { ReactQueryOptions, ReactMutationOptions } from '../types';
import { userKeys } from './keys';
import { GetUserProfileInput, UpdateUserProfileInput } from './input';
import { env } from '../../config';
import * as userApi from './apis';
import type { User } from './types';

/**
 * Hook to fetch user profile for current user
 *
 * @param input - Optional user profile request parameters
 * @param input.userName - Optional user name (defaults to current user)
 * @param options - React Query options (enabled, initialData, etc.)
 * @returns Query result with user profile, loading state, and error
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading, error } = useGetUserProfile();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 *
 * return <ProfileView user={profile?.data} />;
 * ```
 */
export const useGetUserProfile = (
  input?: GetUserProfileInput,
  options?: ReactQueryOptions<{ data: User } | null> & { useMock?: boolean }
) => {
  const { enabled = true, initialData, useMock, ...rest } = options || {};
  const { user } = useAuth();

  const shouldUseMock = useMock ?? input?.useMock ?? env.useMockData;

  return useQuery<{ data: User } | null>({
    ...rest,
    enabled: Boolean(enabled),
    queryKey: [userKeys.get.create(input)],
    queryFn: async () => {
      const result = await userApi.getUserProfile({
        params: { ...input, useMock: shouldUseMock, user },
      });
      return result;
    },
    initialData: initialData as { data: User } | null | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to update user profile
 * Note: Currently not supported as there's no backend endpoint
 *
 * @param options - Mutation options (onSuccess, onError)
 * @returns Mutation object with mutate function and state
 *
 * @example
 * ```tsx
 * const updateProfile = useUpdateUserProfile({
 *   onSuccess: (data) => {
 *     message.success('Profile updated successfully');
 *   },
 *   onError: (error) => {
 *     message.error('Failed to update profile');
 *   }
 * });
 *
 * updateProfile.mutate({
 *   payload: {
 *     firstName: 'John',
 *     lastName: 'Doe'
 *   }
 * });
 * ```
 */
export const useUpdateUserProfile = (options?: ReactMutationOptions<{ data: User } | null, Error, UpdateUserProfileInput>) => {
  const queryClient = useQueryClient();

  return useMutation<{ data: User } | null, Error, UpdateUserProfileInput>({
    mutationFn: async (payload: UpdateUserProfileInput) => {
      const result = await userApi.updateUserProfile({ payload });
      return result;
    },
    onSuccess: (data, variables, context, mutation) => {
      // Invalidate relevant queries
      userKeys.all.invalidateQueries(queryClient);
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      options?.onError?.(error, variables, context, mutation);
    },
  });
};
