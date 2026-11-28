import { enterDemo, expect, test } from './fixtures';

/**
 * Партнёр — отдельный кабинет: свои задачи, отклики и никаких студенческих механик.
 */
test('партнёр: отдельный профиль, своя задача и возврат к студенту', async ({ page }) => {
  await enterDemo(page);

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page.getByRole('menuitem', { name: 'Профиль партнёра' }).click();

  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByRole('heading', { name: 'Кабинет партнёра' })).toBeVisible();
  await expect(page.getByText(/Режим «Партнёр и кафедра»/)).toBeVisible();

  // Студенческих механик в навигации партнёра нет
  await expect(page.getByRole('link', { name: 'Кошелёк' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Матч' })).toHaveCount(0);

  await page.goto('/app/decomposer');
  await page.getByLabel('Новая задача партнёра').fill('Проверка доступности мобильного приложения');
  await page.getByRole('button', { name: 'Разложить на учебные кейсы' }).click();

  await expect(
    page.getByText('Кейсы сгенерированы на сервере по тегам задачи'),
  ).toBeVisible();
  await expect(page.getByText(/Шаг 1 из/)).toBeVisible();

  // Сброс демо не выбрасывает из партнёрского профиля
  await page.goto('/app/demo');
  await page.getByRole('button', { name: 'Сбросить демо' }).click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByRole('heading', { name: 'Кабинет партнёра' })).toBeVisible();

  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page.getByRole('menuitem', { name: 'Профиль студента' }).click();
  await expect(page.getByText(/Режим «Партнёр и кафедра»/)).toBeHidden();
});

test('партнёр: публикация задачи и смена статуса отклика', async ({ page }) => {
  await enterDemo(page);
  await page.getByRole('button', { name: 'Меню профиля' }).click();
  await page.getByRole('menuitem', { name: 'Профиль партнёра' }).click();
  await expect(page.getByRole('heading', { name: 'Кабинет партнёра' })).toBeVisible();

  const unique = `Проверка гипотезы ${Date.now().toString().slice(-5)}`;

  await page.goto('/app/partner/tasks/new');
  await page.getByLabel('Название задачи').fill(unique);
  await page
    .getByLabel('Что нужно сделать')
    .fill('Собрать прототип проверки гипотезы на демонстрационных данных и защитить результат.');

  const skill = page.getByLabel('Требование: Данные');
  await skill.focus();
  for (let step = 0; step < 12; step += 1) {
    await skill.press('ArrowRight');
  }

  await page.getByRole('button', { name: 'Опубликовать задачу' }).click();
  await expect(page).toHaveURL(/\/app\/partner\/tasks$/);
  await expect(page.getByRole('heading', { name: unique })).toBeVisible();

  // Отклик в кабинете меняет статус и сохраняется на сервере
  await page.goto('/app/');
  const statusSelect = page.getByLabel(/Статус отклика/).first();
  await statusSelect.selectOption('invited');
  await expect(statusSelect).toHaveValue('invited');

  await page.reload();
  await expect(page.getByLabel(/Статус отклика/).first()).toHaveValue('invited');

  // Убираем тестовую задачу, чтобы прогоны не копили мусор
  await page.evaluate(async (title) => {
    const token = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    const list = await fetch('/api/partner/tasks/', { credentials: 'same-origin' }).then((r) =>
      r.json(),
    );
    const task = list.tasks.find((item: { title: string }) => item.title === title);
    if (task) {
      await fetch(`/api/partner/tasks/${task.id}/`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: token ? { 'X-CSRFToken': token } : {},
      });
    }
  }, unique);
});
