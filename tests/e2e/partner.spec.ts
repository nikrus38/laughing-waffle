import { enterDemo, expect, test } from './fixtures';

/**
 * Партнёр — отдельный демо-профиль: своя сессия, своё имя, свой кабинет.
 * Проверяем переключение, работу декомпозиции и возврат к студенту.
 */
test('партнёр: отдельный профиль, своя задача и возврат к студенту', async ({ page }) => {
  await enterDemo(page);

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page.getByRole('menuitem', { name: 'Профиль партнёра' }).click();

  await expect(page).toHaveURL(/\/app\/?$/);
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

  // Сброс не должен выбрасывать из профиля партнёра
  await expect(page.getByText(/Режим «Партнёр и кафедра»/)).toBeVisible();

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page.getByRole('menuitem', { name: 'Профиль студента' }).click();
  await expect(page.getByText(/Режим «Партнёр и кафедра»/)).toBeHidden();
});
