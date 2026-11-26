import { expect, test } from './fixtures';

/**
 * Проверяем, что service worker установлен и умеет отдать офлайн-страницу:
 * без этого установка как приложение формально работает, но в метро — нет.
 */
test('офлайн-фолбэк открывает страницу «Нет соединения»', async ({ page, context }) => {
  // Берём страницу, которой нет в офлайн-оболочке: главная кэшируется и открывается сама.
  await page.goto('/features/');

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });

  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Нет соединения' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});
