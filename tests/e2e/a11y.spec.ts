import AxeBuilder from '@axe-core/playwright';
import { enterDemo, expect, test } from './fixtures';

/**
 * Базовый аудит доступности: ловим только серьёзные и критичные нарушения,
 * чтобы не блокировать сборку из-за стилистических предупреждений.
 */
function seriousViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    }));
}

test('главная страница без критичных нарушений WCAG AA', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(seriousViolations(results)).toEqual([]);
});

test('консоль без критичных нарушений WCAG AA', async ({ page }) => {
  await enterDemo(page);
  await page.goto('/app/wallet');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(seriousViolations(results)).toEqual([]);
});
