import { enterDemo, expect, test } from './fixtures';

test('профиль: меню аватара, правка имени и сохранение', async ({ page }) => {
  await enterDemo(page);

  // Плашка профиля открывается из шапки и ведёт в настройки
  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await expect(page.getByRole('menu', { name: 'Профиль' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Профиль и настройки' }).click();

  await expect(page).toHaveURL(/\/app\/profile$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Профиль' })).toBeVisible();

  const name = page.getByLabel('Отображаемое имя');
  await expect(name).toHaveValue('Александр Петров');

  await name.fill('Иван Соколов');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Профиль сохранён')).toBeVisible();

  // Значение доехало до сервера, а не осталось в памяти вкладки
  await page.reload();
  await expect(page.getByLabel('Отображаемое имя')).toHaveValue('Иван Соколов');

  // Возвращаем демо-персону, чтобы прогон был повторяемым
  await page.getByLabel('Отображаемое имя').fill('Александр Петров');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Профиль сохранён')).toBeVisible();
});

test('профиль: интересы добавляются и удаляются', async ({ page }) => {
  await enterDemo(page);
  await page.goto('/app/profile');

  const input = page.getByLabel('Новый интерес');
  await input.fill('риск-аналитика');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByRole('button', { name: 'Убрать интерес «риск-аналитика»' })).toBeVisible();

  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Профиль сохранён')).toBeVisible();

  await page.getByRole('button', { name: 'Убрать интерес «риск-аналитика»' }).click();
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Профиль сохранён')).toBeVisible();
});
