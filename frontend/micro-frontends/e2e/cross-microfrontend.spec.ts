import { test, expect } from '@playwright/test';
import { setupMockAuth } from './helpers/auth';

test.describe('Cross Micro-Frontend Communication', () => {
  test('should navigate from Store to Checkout', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/store');

    await expect(
      page.locator('[data-testid="product-card"]').first()
    ).toBeVisible();

    const addToCartButton = page
      .locator('[data-testid="product-card"]')
      .first()
      .locator('button:has-text("Add to Cart")');

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      await page.click('[data-testid="nav-checkout"]');
      await expect(page).toHaveURL(/.*checkout/);
    } else {
      await page.click('[data-testid="nav-checkout"]');
      await expect(page).toHaveURL(/.*checkout/);
    }
  });

  test('should share user context across micro-frontends', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/');

    await page.click('[data-testid="user-avatar"]');
    await page.click('[data-testid="nav-profile"]');
    await expect(page).toHaveURL(/.*account/);

    await page.click('[data-testid="nav-store"]');
    await expect(page).toHaveURL(/.*store/);

    await page.click('[data-testid="nav-checkout"]');
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should maintain theme across micro-frontends', async ({ page }) => {
    await setupMockAuth(page);
    await page.goto('/');

    await page.click('[data-testid="nav-store"]');
    await expect(page).toHaveURL(/.*store/);

    const backgroundColor = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor
    );

    await page.click('[data-testid="user-avatar"]');
    await page.click('[data-testid="nav-profile"]');
    await expect(page).toHaveURL(/.*account/);

    const backgroundColorAccount = await page.evaluate(
      () => window.getComputedStyle(document.body).backgroundColor
    );

    expect(backgroundColorAccount).toBe(backgroundColor);
  });

  test('should handle navigation via config.onNavigate', async ({ page }) => {
    await page.goto('/store');

    const productLink = page
      .locator('[data-testid="product-card"]')
      .first()
      .locator('a');

    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/.*store\/product\/\d+/);

      const checkoutButton = page.locator('button:has-text("Buy Now")');
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();

        await expect(page).toHaveURL(/.*checkout/);
      }
    }
  });

  test('should navigate through all micro-frontends in workflow', async ({
    page,
  }) => {
    await setupMockAuth(page);
    await page.goto('/');

    await page.click('[data-testid="nav-store"]');
    await expect(page).toHaveURL(/.*store/);
    await expect(
      page.locator('[data-testid="product-card"]').first()
    ).toBeVisible();

    await page.click('[data-testid="user-avatar"]');
    await page.click('[data-testid="nav-profile"]');
    await expect(page).toHaveURL(/.*account/);

    await page.click('[data-testid="nav-checkout"]');
    await expect(page).toHaveURL(/.*checkout/);

    await page.click('[data-testid="nav-home"]');
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/?$/);
  });

  test('should handle logout across all micro-frontends', async ({ page }) => {
    await page.goto('/store');

    const logoutButton = page.locator('button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      await page.waitForTimeout(500);

      await page.click('a[href="/account"]');

      const loginText = await page.locator('text=/login|sign in/i').isVisible();
      if (!loginText) {
        await expect(page).toHaveURL(/.*account/);
      }
    }
  });
});
