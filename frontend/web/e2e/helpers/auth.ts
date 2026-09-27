import { Page } from '@playwright/test';

/**
 * Mock user data for E2E tests
 */
export const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'user' as const,
};

/**
 * Mock authentication token
 */
export const mockAuthToken = 'mock-e2e-auth-token-' + Date.now();

/**
 * Set up mock authentication for E2E tests
 *
 * This function injects authentication state into the browser's localStorage,
 * making the app think the user is logged in.
 *
 * @param page - Playwright Page instance
 * @param user - Optional custom user data (defaults to mockUser)
 */
export async function setupMockAuth(page: Page, user = mockUser) {
  await page.addInitScript(
    (authData) => {
      localStorage.setItem('auth_token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('isAuthenticated', 'true');
    },
    { token: mockAuthToken, user }
  );
}

/**
 * Clear authentication state
 *
 * @param page - Playwright Page instance
 */
export async function clearMockAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  });
}

/**
 * Navigate with authentication
 *
 * Helper function that sets up authentication and then navigates to a URL
 *
 * @param page - Playwright Page instance
 * @param url - URL to navigate to
 * @param user - Optional custom user data
 */
export async function navigateWithAuth(
  page: Page,
  url: string,
  user = mockUser
) {
  await setupMockAuth(page, user);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user avatar is visible (indicates authenticated state)
 *
 * @param page - Playwright Page instance
 */
export async function isUserAvatarVisible(page: Page): Promise<boolean> {
  const avatar = page.locator('[data-testid="user-avatar"]');
  return await avatar.isVisible({ timeout: 3000 }).catch(() => false);
}

/**
 * Wait for authentication state to be loaded
 *
 * @param page - Playwright Page instance
 * @param authenticated - Expected authentication state
 */
export async function waitForAuthState(
  page: Page,
  authenticated: boolean = true
) {
  if (authenticated) {
    await page.waitForSelector('[data-testid="user-avatar"]', {
      state: 'visible',
      timeout: 5000,
    });
  } else {
    await page.waitForSelector('[data-testid="login-button"]', {
      state: 'visible',
      timeout: 5000,
    });
  }
}
