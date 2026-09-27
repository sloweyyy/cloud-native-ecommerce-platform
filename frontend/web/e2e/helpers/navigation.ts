import { Page } from '@playwright/test';

export async function navigateToStore(page: Page) {
  await page.click('[data-testid="nav-store"]');
  await page.waitForURL(/.*\/store/);
}

export async function navigateToHome(page: Page) {
  await page.click('[data-testid="nav-home"]');
  await page.waitForURL(/^http:\/\/localhost:4200\/?$/);
}

export async function navigateToCheckout(page: Page) {
  await page.click('[data-testid="nav-checkout"]');
  await page.waitForURL(/.*\/checkout/);
}

export async function navigateToAccount(page: Page) {
  const avatar = page.locator('[data-testid="user-avatar"]');
  const loginButton = page.locator('[data-testid="login-button"]');

  const isAuthenticated = await avatar.isVisible();

  if (isAuthenticated) {
    await avatar.click();
    await page.click('[data-testid="nav-profile"]');
    await page.waitForURL(/.*\/account/);
  } else if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForURL(/.*\/login/);
  }
}

export async function navigateToAccountOrders(page: Page) {
  const avatar = page.locator('[data-testid="user-avatar"]');
  if (await avatar.isVisible()) {
    await avatar.click();
    await page.click('[data-testid="nav-orders"]');
  }
}

export async function logout(page: Page) {
  const avatar = page.locator('[data-testid="user-avatar"]');
  if (await avatar.isVisible()) {
    await avatar.click();
    await page.click('[data-testid="nav-logout"]');
  }
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}
