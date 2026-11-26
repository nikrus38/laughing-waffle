import { test as base, expect, type Page } from '@playwright/test';

/**
 * Общая обвязка e2e: собираем ошибки консоли и падения страницы,
 * чтобы тест падал не только на отсутствующем тексте, но и на JS-ошибках.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await use(errors);
  },
});

test.afterEach(async ({ consoleErrors }) => {
  expect(consoleErrors, 'ошибки в консоли браузера').toEqual([]);
});

export { expect };

/** Сброс состояния через API с CSRF-токеном из текущей сессии. */
async function resetDemo(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    await fetch('/api/demo/reset/', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(match ? { 'X-CSRFToken': match[1] } : {}),
      },
      body: '{}',
    });
  });
}

/** Вход демо-студентом и сброс состояния, чтобы прогон был повторяемым. */
export async function enterDemo(page: Page): Promise<void> {
  await page.goto('/demo-login/');

  const bootstrap = page.waitForResponse(
    (response) => response.url().includes('/api/bootstrap/') && response.ok(),
  );
  await page.goto('/app/');
  await bootstrap.catch(() => undefined);

  await resetDemo(page);
  await page.goto('/app/');

  const skip = page.getByRole('button', { name: 'Пропустить' });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}
