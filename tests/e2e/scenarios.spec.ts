import { enterDemo, expect, test } from './fixtures';

/**
 * Сценарий 1 из раздела 7.10 мастер-промта:
 * матч → отклик → план первого месяца → модуль → +20 FinCoin → проверка реестра.
 */
test('первый месяц первокурсника: матч, модуль и FinCoin', async ({ page }) => {
  await enterDemo(page);

  await page.goto('/app/matcher');
  await expect(page.getByRole('heading', { name: 'ИИ-сват' })).toBeVisible();

  const apply = page.getByRole('button', { name: 'Откликнуться' }).first();
  await apply.click();

  await expect(page.getByRole('heading', { name: 'План первого месяца' })).toBeVisible();
  await page.getByRole('button', { name: 'Перейти к двойнику' }).click();

  await expect(page.getByRole('heading', { name: 'Цифровой двойник' })).toBeVisible();
  await page.getByRole('button', { name: 'Начать модуль' }).first().click();

  await expect(page.getByRole('heading', { name: 'Модуль засчитан' })).toBeVisible();
  await expect(page.getByText('+20 FinCoin')).toBeVisible();
  await page.getByRole('button', { name: 'Продолжить' }).click();

  await page.goto('/app/wallet');
  await page.getByRole('button', { name: 'Проверить цепочку' }).click();
  await expect(page.getByText(/Цепочка целостна/)).toBeVisible();
});

/**
 * Сценарий 2: запрос индустрии → декомпозиция → учебные кейсы.
 * Проверяем, что кейсы приходят с сервера, а не только из клиентских моков.
 */
test('запрос индустрии: декомпозиция задачи на кейсы', async ({ page }) => {
  await enterDemo(page);

  await page.goto('/app/decomposer');
  await expect(page.getByRole('heading', { name: 'Декомпозиция задач' })).toBeVisible();

  await page.getByRole('button', { name: 'Разложить на учебные кейсы' }).click();

  await expect(page.getByText('Итого FinCoin за сквозную задачу')).toBeVisible();
  await expect(page.getByText('Готовый пример рассчитан на сервере')).toBeVisible();
  await expect(page.getByText(/Шаг 1 из/)).toBeVisible();
});

/**
 * Сценарий 3: соблазн лёгких баллов.
 * При максимальном искушении алгоритм всё равно предлагает путь развития.
 */
test('соблазн лёгких баллов: этический фильтр не меняет рекомендацию', async ({ page }) => {
  await enterDemo(page);

  await page.goto('/app/ethics');
  await page.getByRole('tab', { name: 'Искушение' }).click();

  const slider = page.getByRole('slider');
  await slider.fill('100');

  await expect(page.getByText('Этичный выбор')).toBeVisible();
  await expect(page.getByText('Даже при максимальном искушении')).toBeVisible();

  await page.getByRole('tab', { name: 'Журнал' }).click();
  await expect(page.getByText('MATCH-001').first()).toBeVisible();
});
