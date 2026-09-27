import { Page, expect } from '@playwright/test';

export async function waitForMicroFrontendLoad(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(500);
}

export async function navigateAndWait(page: Page, url: string) {
  await page.goto(url);
  await waitForMicroFrontendLoad(page);
}

export async function expectPageToLoad(page: Page, urlPattern: RegExp) {
  await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
  await waitForMicroFrontendLoad(page);
}

export async function clickAndWait(page: Page, selector: string) {
  await page.click(selector);
  await waitForMicroFrontendLoad(page);
}

export async function getErrorMessages(page: Page): Promise<string[]> {
  const errorLogs: string[] = [];

  page.on('pageerror', (error) => {
    errorLogs.push(error.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errorLogs.push(msg.text());
    }
  });

  return errorLogs;
}

export async function isElementVisible(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}
