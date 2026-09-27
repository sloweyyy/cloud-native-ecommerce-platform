import { test, expect } from '@playwright/test';
import { setupMockAuth } from './helpers/auth';

test.describe('Module Federation - Dynamic Loading', () => {
  test('should load Store micro-frontend dynamically', async ({ page }) => {
    await page.goto('/store');

    await expect(page).toHaveURL(/.*store/);

    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should load Account micro-frontend dynamically', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/account');

    await expect(page).toHaveURL(/.*account/);

    // Account MFE loads successfully - check for any content
    await expect(
      page.locator('.ant-layout, .account-container, h1, h2').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load Checkout micro-frontend dynamically', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/checkout');

    await expect(page).toHaveURL(/.*checkout/);

    // Checkout MFE loads successfully - check for any content
    await expect(
      page.locator('.ant-layout, .checkout-container, h1, h2').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should load multiple micro-frontends in sequence', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/');

    await page.click('[data-testid="nav-store"]');
    await expect(page).toHaveURL(/.*store/);
    await expect(
      page.locator('[data-testid="product-card"]').first()
    ).toBeVisible({ timeout: 10000 });

    await page.click('[data-testid="user-avatar"]');
    await page.click('[data-testid="nav-profile"]');
    await expect(page).toHaveURL(/.*account/);

    await page.click('[data-testid="nav-checkout"]');
    await expect(page).toHaveURL(/.*checkout/);

    await page.click('[data-testid="nav-home"]');
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/?$/);
  });

  test('should handle module loading errors gracefully', async ({ page }) => {
    page.on('pageerror', (error) => {
      console.log('Page error:', error.message);
    });

    await page.goto('/store');

    const hasErrorBoundary = await page
      .locator('[role="alert"], .error-boundary')
      .count();
    expect(hasErrorBoundary).toBe(0);
  });

  test('should maintain module state during navigation', async ({ page }) => {
    await page.goto('/store');

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.waitFor({ state: 'visible' });

    const productName = await firstProduct
      .locator('[data-testid="product-name"]')
      .textContent();

    await page.goto('/account');
    await page.goBack();

    await expect(page).toHaveURL(/.*store/);
    await expect(firstProduct).toBeVisible();

    const productNameAfterBack = await firstProduct
      .locator('[data-testid="product-name"]')
      .textContent();
    expect(productNameAfterBack).toBe(productName);
  });
});
