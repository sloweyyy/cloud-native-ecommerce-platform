/**
 * Helper functions for checkout page
 */

type User = {
  email?: string;
};

/**
 * Get user email from auth user
 *
 * @param user - Auth user object
 * @returns Email string or empty string if not available
 */
export function getUserEmail(user: User | null | undefined): string {
  return user?.email || '';
}

/**
 * Handle navigation to store page
 *
 * @param config - App config with navigation handler
 */
export function handleNavigateToStore(config?: {
  onNavigate?: (path: string) => void;
}): void {
  if (config?.onNavigate) {
    config.onNavigate('/store');
  } else {
    window.location.href = '/store';
  }
}
