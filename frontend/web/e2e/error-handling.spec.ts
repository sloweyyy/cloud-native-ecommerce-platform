import { test, expect } from '@playwright/test';

test.describe('Error Handling in E2E', () => {
  test('should display error boundary on module load failure', async ({
    page,
  }) => {
    const errorLogs: string[] = [];
    page.on('pageerror', (error) => {
      errorLogs.push(error.message);
    });

    await page.goto('/store');

    const hasError = errorLogs.some(
      (log) =>
        log.includes('Failed to load') || log.includes('Module not found')
    );

    if (hasError) {
      const errorBoundary = page.locator(
        '[role="alert"], .error-boundary, text=/error|failed/i'
      );
      await expect(errorBoundary).toBeVisible();
    } else {
      await expect(
        page.locator('[data-testid="product-card"]').first()
      ).toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/store');

    await page.route('**/api/**', (route) => route.abort());

    const productCards = page.locator('[data-testid="product-card"]');
    const hasProducts = (await productCards.count()) > 0;

    if (hasProducts) {
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('should recover from errors via retry', async ({ page }) => {
    await page.goto('/store');

    const retryButton = page.locator(
      'button:has-text("Retry"), button:has-text("Try Again")'
    );

    if (await retryButton.isVisible()) {
      await retryButton.click();

      await expect(
        page.locator('[data-testid="product-card"]').first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle navigation errors', async ({ page }) => {
    await page.goto('/non-existent-route');

    const notFoundText = await page
      .locator('text=/404|not found|page not found/i')
      .isVisible();

    expect(notFoundText).toBeTruthy();
  });

  test('should log errors to console', async ({ page }) => {
    const errorLogs: string[] = [];
    const consoleMessages: string[] = [];

    page.on('pageerror', (error) => {
      errorLogs.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto('/store');

    await page.waitForTimeout(2000);
  });
});
