import { enterDemo, expect, test } from './fixtures';

/**
 * Роль «Партнёр и кафедра»: переключение, декомпозиция своей задачи
 * и полный сброс демо обратно к студенту.
 */
test('партнёр: роль, своя задача и сброс демо', async ({ page }) => {
  await enterDemo(page);

  await page.getByRole('button', { name: /Переключить роль/ }).click();
  await expect(page.getByText(/Режим «Партнёр и кафедра»/)).toBeVisible();

  await page.goto('/app/decomposer');
  await page.getByLabel('Новая задача партнёра').fill('Проверка доступности мобильного приложения');
  await page.getByRole('button', { name: 'Разложить на учебные кейсы' }).click();

  await expect(
    page.getByText('Кейсы сгенерированы на сервере по тегам задачи'),
  ).toBeVisible();
  await expect(page.getByText(/Шаг 1 из/)).toBeVisible();

  await page.goto('/app/demo');
  await page.getByRole('button', { name: 'Сбросить демо' }).click();

  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByRole('button', { name: /Переключить роль/ })).toContainText('Студент');
});
