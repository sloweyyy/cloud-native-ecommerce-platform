import { test, expect } from '@playwright/test';
import {
  navigateToStore,
  navigateToHome,
  navigateToCheckout,
  waitForPageLoad,
} from './helpers/navigation';

test.describe('Browser History Navigation', () => {
  test('should support browser back navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/?$/);

    await navigateToStore(page);
    await expect(page).toHaveURL(/.*store/);

    await navigateToCheckout(page);
    await expect(page).toHaveURL(/.*checkout/);

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*store/);

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/?$/);
  });

  test('should support browser forward navigation', async ({ page }) => {
    await page.goto('/');

    await navigateToStore(page);
    await expect(page).toHaveURL(/.*store/);

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/^http:\/\/localhost:4200\/?$/);

    await page.goForward();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*store/);
  });

  test('should handle history with nested routes', async ({ page }) => {
    await page.goto('/store');
    await expect(page).toHaveURL(/.*store/);
    await waitForPageLoad(page);

    const productCover = page.locator('[data-testid="product-cover"]').first();
    await productCover.waitFor({ state: 'visible', timeout: 10000 });
    await productCover.click();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*store\/product\/\d+/);
    await expect(page.locator('[data-testid="product-detail"]')).toBeVisible();

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*store$/);
  });

  test('should preserve history state across micro-frontends', async ({
    page,
  }) => {
    const urls: string[] = [];

    await page.goto('/');
    urls.push(page.url());

    await navigateToStore(page);
    urls.push(page.url());

    await navigateToHome(page);
    urls.push(page.url());

    await navigateToCheckout(page);
    urls.push(page.url());

    await page.goBack();
    await waitForPageLoad(page);
    expect(page.url()).toBe(urls[2]);

    await page.goBack();
    await waitForPageLoad(page);
    expect(page.url()).toBe(urls[1]);

    await page.goBack();
    await waitForPageLoad(page);
    expect(page.url()).toBe(urls[0]);
  });

  test('should handle browser refresh on nested route', async ({ page }) => {
    await page.goto('/store/product/1');

    await expect(page).toHaveURL(/.*store\/product\/1/);

    await page.waitForSelector('[data-testid="product-detail"]', {
      state: 'visible',
      timeout: 15000,
    });

    const productName = await page.textContent('h2');
    expect(productName).toBeTruthy();

    await page.reload();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/.*store\/product\/1/);
    await page.waitForSelector('[data-testid="product-detail"]', {
      state: 'visible',
      timeout: 15000,
    });
  });

  test('should support history with query parameters', async ({ page }) => {
    await page.goto('/store?category=electronics');

    await expect(page).toHaveURL(/.*store\?category=electronics/);

    await navigateToHome(page);

    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(/.*store\?category=electronics/);
  });
});
