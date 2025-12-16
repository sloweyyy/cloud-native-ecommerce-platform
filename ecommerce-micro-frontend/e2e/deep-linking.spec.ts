import { test, expect } from '@playwright/test';
import { setupMockAuth } from './helpers/auth';

test.describe('Deep Linking and URL Management', () => {
  test('should support deep linking to Store product', async ({ page }) => {
    await page.goto('/store/product/1');

    await expect(page).toHaveURL(/.*store\/product\/1/);
    await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
  });

  test('should support deep linking with multiple path segments', async ({
    page,
  }) => {
    await page.goto('/store/product/3');

    await expect(page).toHaveURL(/.*store\/product\/3/);
  });

  test('should handle 404 for invalid deep links', async ({ page }) => {
    await page.goto('/store/product/9999');

    await expect(page).toHaveURL(/.*store\/product\/9999/);

    const notFoundText = await page
      .locator('text=/not found|product not found/i')
      .isVisible();
    expect(notFoundText).toBeTruthy();
  });

  test('should preserve query parameters in deep links', async ({ page }) => {
    await page.goto('/store/product/1?variant=blue&size=large');

    await expect(page).toHaveURL(
      /.*store\/product\/1\?variant=blue&size=large/
    );
  });

  test('should handle deep linking to Account', async ({ page }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/.*account/);
  });

  test('should handle deep linking to Checkout', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should navigate from deep link to other routes', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/store/product/2');

    await expect(page).toHaveURL(/.*store\/product\/2/);

    const backButton = page.locator('[data-testid="back-to-store-button"]');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/.*store$/);
    }

    await page.click('[data-testid="user-avatar"]');
    await page.click('[data-testid="nav-profile"]');
    await expect(page).toHaveURL(/.*account/);
  });

  test('should handle browser refresh on deep link', async ({ page }) => {
    await page.goto('/store/product/1');
    await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/.*store\/product\/1/);
    await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();
  });
});
