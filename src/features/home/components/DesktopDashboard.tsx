import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useStore } from '../../../shared/store/useStore';
import { ACTION_ICONS, ACTION_NAMES } from '../../../shared/lib/fincoin';
import { getDevelopmentZone } from '../../../domain/twin';
import { getValueName } from '../../../data/values';
import { CompetencyId, FinCoinAction } from '../../../domain/types';

const PERIODS = [
  { id: '7', label: 'Последние 7 дней' },
  { id: '30', label: 'Последние 30 дней' },
  { id: 'all', label: 'Всё время' },
] as const;

type PeriodId = (typeof PERIODS)[number]['id'];
type Metric = 'amount' | 'count';

const COMPETENCY_LABELS: Record<CompetencyId, string> = {
  data: 'Данные',
  code: 'Программирование',
  finance: 'Финансы',
  comm: 'Коммуникация',
  research: 'Исследование',
  entre: 'Предпринимательство',
  ai: 'ИИ-грамотность',
  lead: 'Лидерство',
};

const DAY_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const LEVELS = [
  { min: 0, name: 'Новичок', next: 200 },
  { min: 200, name: 'Студент', next: 500 },
  { min: 500, name: 'Профи', next: 1000 },
  { min: 1000, name: 'Эксперт', next: 1500 },
];

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

const DesktopDashboard: React.FC = () => {
  const user = useStore((s) => s.user);
  const balance = useStore((s) => s.finCoinBalance);
  const ledger = useStore((s) => s.ledger);
  const ethicsLog = useStore((s) => s.ethicsLog);
  const [period, setPeriod] = useState<PeriodId>('30');
  const [metric, setMetric] = useState<Metric>('amount');

  const days = period === 'all' ? 30 : Number(period);
  const since = useMemo(() => {
    if (period === 'all') return 0;
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - (days - 1));
    return date.getTime();
  }, [period, days]);

  const periodEntries = useMemo(
    () => ledger.filter((entry) => entry.ts >= since),
    [ledger, since],
  );

  const totalAmount = periodEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const previousAmount = useMemo(() => {
    if (period === 'all') return null;
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - (days * 2 - 1));
    const end = since;
    return ledger
      .filter((entry) => entry.ts >= start.getTime() && entry.ts < end)
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [ledger, since, days, period]);

  const delta = previousAmount === null || previousAmount === 0 ? null : Math.round(((totalAmount - previousAmount) / previousAmount) * 100);

  const chart = useMemo(() => {
    const today = startOfDay(new Date());
    const buckets: Array<{ date: Date; amount: number; count: number }> = [];

    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      buckets.push({ date, amount: 0, count: 0 });
    }

    for (const entry of ledger) {
      const day = startOfDay(new Date(entry.ts));
      const bucket = buckets.find((item) => item.date.getTime() === day.getTime());
      if (bucket) {
        bucket.amount += entry.amount;
        bucket.count += 1;
      }
    }
    return buckets;
  }, [ledger, days]);

  const chartMax = Math.max(1, ...chart.map((item) => (metric === 'amount' ? item.amount : item.count)));
  const axisMax = Math.ceil(chartMax / 4) * 4;

  const topActions = useMemo(() => {
    const totals = new Map<FinCoinAction, number>();
    for (const entry of periodEntries) {
      totals.set(entry.action, (totals.get(entry.action) ?? 0) + entry.amount);
    }
    const rows = [...totals.entries()]
      .map(([action, amount]) => ({ action, amount }))
      .sort((a, b) => b.amount - a.amount);
    const max = Math.max(1, ...rows.map((row) => row.amount));
    return rows.slice(0, 4).map((row) => ({ ...row, share: row.amount / max }));
  }, [periodEntries]);

  const zone = useMemo(() => getDevelopmentZone(user), [user]);

  const heatmap = useMemo(() => {
    const today = startOfDay(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - 118);
    const shift = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - shift);

    const cells: Array<{ date: Date; count: number }> = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const count = ledger.filter(
        (entry) => startOfDay(new Date(entry.ts)).getTime() === cursor.getTime(),
      ).length;
      cells.push({ date: new Date(cursor), count });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [ledger]);

  const heatWeeks = useMemo(() => {
    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    for (let index = 0; index < heatmap.length; index += 7) {
      weeks.push(heatmap.slice(index, index + 7));
    }
    return weeks;
  }, [heatmap]);

  const streak = useMemo(() => {
    let best = 0;
    let current = 0;
    for (const cell of heatmap) {
      if (cell.count > 0) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }, [heatmap]);

  const activeDays = heatmap.filter((cell) => cell.count > 0).length;
  const avgPerDay = activeDays === 0 ? 0 : totalAmount / Math.max(1, days);
  const recent = [...ledger].sort((a, b) => b.ts - a.ts).slice(0, 5);

  const level = [...LEVELS].reverse().find((item) => balance >= item.min) ?? LEVELS[0]!;
  const nextLevel = LEVELS.find((item) => item.min > level.min);
  const levelProgress = nextLevel
    ? Math.min(100, ((balance - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  return (
    <div className="console-dark">
      <header className="flex flex-wrap items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #233e76 0%, #0198af 100%)' }}
          aria-hidden="true"
        >
          {user.displayName
            .split(' ')
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join('')}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-[color:var(--dash-text)]">
            {user.displayName}
          </h1>
          <p className="text-xs text-[color:var(--dash-muted)]">
            {user.course} курс · Финуниверситет · демо-профиль
          </p>
        </div>
        <span className="ml-auto rounded-full border border-[color:var(--dash-border)] px-2.5 py-1 text-[10px] text-[color:var(--dash-muted)]">
          {zone.length} компетенций в зоне роста
        </span>
      </header>

      <section className="dash-panel mt-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-[color:var(--dash-text)]">Сводка FinCoin</h2>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodId)}
            aria-label="Период сводки"
          >
            {PERIODS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="dash-segment flex" role="tablist" aria-label="Метрика графика">
            <button
              type="button"
              role="tab"
              aria-selected={metric === 'amount'}
              onClick={() => setMetric('amount')}
            >
              FinCoin
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={metric === 'count'}
              onClick={() => setMetric('count')}
            >
              Записи
            </button>
          </div>

          <Link to="/wallet" className="dash-link ml-auto inline-flex items-center gap-1">
            Вся активность
            <ArrowTopRightOnSquareIcon className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_300px] gap-6">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="tnum text-4xl font-bold text-[color:var(--dash-text)]">
                {metric === 'amount' ? totalAmount : periodEntries.length}
              </span>
              <span className="text-xs text-[color:var(--dash-muted)]">
                {metric === 'amount' ? 'FinCoin за период' : 'записей за период'}
              </span>
            </div>

            <p className="mt-1 text-xs">
              {delta === null ? (
                <span className="text-[color:var(--dash-muted)]">нет данных для сравнения</span>
              ) : (
                <span style={{ color: delta >= 0 ? 'var(--dash-accent)' : '#f0736a' }}>
                  {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% к прошлому периоду
                </span>
              )}
            </p>

            <div className="mt-5 flex gap-2">
              <div className="flex w-7 shrink-0 flex-col justify-between py-0.5 text-right text-[9px] text-[color:var(--dash-muted)]">
                <span>{axisMax}</span>
                <span>{Math.round(axisMax / 2)}</span>
                <span>0</span>
              </div>

              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2].map((line) => (
                    <span key={line} className="block border-t border-[color:var(--dash-border)]" />
                  ))}
                </div>

                <div
                  className="relative flex h-36 gap-[2px]"
                  role="img"
                  aria-label="График начислений по дням"
                >
                  {chart.map((item) => {
                    const value = metric === 'amount' ? item.amount : item.count;
                    const height = value === 0 ? 1.5 : Math.max(4, (value / axisMax) * 100);
                    return (
                      <div
                        key={item.date.toISOString()}
                        className="group relative flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          className="w-full rounded-t-[2px]"
                          style={{
                            height: `${height}%`,
                            minHeight: value === 0 ? '2px' : '4px',
                            background:
                              value === 0
                                ? '#e9eef5'
                                : 'var(--dash-accent)',
                            opacity: value === 0 ? 1 : 0.85,
                          }}
                        />
                        <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded border border-[color:var(--dash-border)] bg-[color:var(--dash-panel-2)] px-1.5 py-0.5 text-[10px] text-[color:var(--dash-text)] group-hover:block">
                          {item.date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}:{' '}
                          {metric === 'amount' ? `${item.amount} FC` : `${item.count} зап.`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex justify-between text-[9px] text-[color:var(--dash-muted)]">
                  <span>{chart[0]?.date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                  <span>
                    {chart[Math.floor(chart.length / 2)]?.date.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                  <span>
                    {chart[chart.length - 1]?.date.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full"
                  style={{ width: `${levelProgress}%`, background: 'var(--dash-accent)' }}
                />
                <div className="h-full flex-1" style={{ background: '#f3e3b8' }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[color:var(--dash-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--dash-accent)' }} />
                  Начислено{' '}
                  <span className="tnum font-medium text-[color:var(--dash-text)]">{balance} FC</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(233,193,92,0.6)' }} />
                  До уровня «{nextLevel?.name ?? 'Эксперт'}»
                  <span className="tnum font-medium text-[color:var(--dash-text)]">
                    {nextLevel ? `${Math.max(0, nextLevel.min - balance)} FC` : '—'}
                  </span>
                </span>
                <span className="text-[10px]">в этом семестре · демо</span>
              </div>
            </div>
          </div>

          <div className="border-l border-[color:var(--dash-border)] pl-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-[color:var(--dash-text)]">Топ действий</h3>
              <span className="text-[10px] text-[color:var(--dash-muted)]">по сумме</span>
            </div>

            <ul className="mt-4 space-y-3.5">
              {topActions.length === 0 && (
                <li className="text-xs text-[color:var(--dash-muted)]">
                  За период начислений не было.
                </li>
              )}
              {topActions.map((row) => (
                <li key={row.action}>
                  <div className="flex items-center gap-2 text-xs">
                    <span aria-hidden="true">{ACTION_ICONS[row.action]}</span>
                    <span className="min-w-0 flex-1 truncate text-[color:var(--dash-text)]">
                      {ACTION_NAMES[row.action]}
                    </span>
                    <span className="tnum font-semibold text-[color:var(--dash-text)]">
                      {row.amount}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${row.share * 100}%`, background: 'var(--dash-violet)' }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-lg border border-[color:var(--dash-border)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--dash-muted)]">
                Всего в реестре
              </p>
              <p className="tnum mt-1 text-lg font-semibold text-[color:var(--dash-text)]">
                {ledger.length} записей
              </p>
              <Link to="/wallet" className="dash-link mt-1 inline-block">
                Проверить цепочку →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dash-panel mt-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-[color:var(--dash-text)]">Активность</h2>
          <span className="text-[11px] text-[color:var(--dash-muted)]">FinCoin за 17 недель</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4">
          {[
            { label: 'Самая длинная серия', value: `${streak} дн.`, hint: 'подряд' },
            {
              label: 'В среднем в день',
              value: `${avgPerDay.toFixed(1)} FC`,
              hint: `${activeDays} активных дней`,
            },
            {
              label: 'В среднем в неделю',
              value: `${(avgPerDay * 7).toFixed(1)} FC`,
              hint: 'по периоду',
            },
            { label: 'Всего', value: `${totalAmount} FC`, hint: 'за период' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[10px] text-[color:var(--dash-muted)]">{stat.label}</p>
              <p className="tnum mt-0.5 text-lg font-semibold text-[color:var(--dash-text)]">
                {stat.value}
              </p>
              <p className="text-[10px] text-[color:var(--dash-muted)]">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-1">
            <div className="ml-5 flex gap-1 text-[8px] text-[color:var(--dash-muted)]">
              {heatWeeks.map((week, index) => {
                const first = week[0]?.date;
                const previous = heatWeeks[index - 1]?.[0]?.date;
                const showMonth =
                  first && (!previous || first.getMonth() !== previous.getMonth());
                return (
                  <span
                    key={index}
                    className="w-3 shrink-0 overflow-visible whitespace-nowrap"
                  >
                    {showMonth ? MONTHS_SHORT[first!.getMonth()] : ''}
                  </span>
                );
              })}
            </div>

            <div className="flex gap-1">
              <div className="flex w-4 flex-col gap-1 text-[8px] text-[color:var(--dash-muted)]">
                {DAY_LABELS.map((day) => (
                  <span key={day} className="flex h-3 items-center leading-none">
                    {day[0]}
                  </span>
                ))}
              </div>

              <div className="grid auto-cols-[12px] grid-flow-col grid-rows-7 gap-1">
                {heatmap.map((cell) => {
                  const levelIndex =
                    cell.count === 0 ? 0 : cell.count === 1 ? 1 : cell.count === 2 ? 2 : 3;
                  const colors = [
                    '#eef2f7',
                    '#c9e9ee',
                    '#7fd3d9',
                    '#0198af',
                  ];
                  return (
                    <span
                      key={cell.date.toISOString()}
                      className="h-3 w-3 rounded-[2px]"
                      style={{ background: colors[levelIndex] }}
                      title={`${cell.date.toLocaleDateString('ru-RU')}: ${cell.count} записей`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1 text-[9px] text-[color:var(--dash-muted)]">
            меньше
            {['#eef2f7', '#c9e9ee', '#7fd3d9', '#0198af'].map(
              (color) => (
                <span
                  key={color}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: color }}
                  aria-hidden="true"
                />
              ),
            )}
            больше
          </div>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-[1.25fr_1fr] gap-3">
        <section className="dash-panel">
          <div className="flex items-center justify-between border-b border-[color:var(--dash-border)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[color:var(--dash-text)]">Последние начисления</h2>
            <Link to="/wallet" className="dash-link">
              Открыть реестр →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-[color:var(--dash-muted)]">
                  <th className="px-4 py-2 font-medium">Дата</th>
                  <th className="px-2 py-2 font-medium">Действие</th>
                  <th className="px-2 py-2 font-medium">Основание</th>
                  <th className="px-4 py-2 text-right font-medium">FC</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-[color:var(--dash-border)] text-xs"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-[color:var(--dash-muted)]">
                      {shortDate(entry.ts)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-[color:var(--dash-text)]">
                      {ACTION_NAMES[entry.action]}
                    </td>
                    <td className="max-w-[200px] truncate px-2 py-2.5 text-[color:var(--dash-muted)]">
                      {entry.basis}
                    </td>
                    <td
                      className="tnum px-4 py-2.5 text-right font-semibold"
                      style={{ color: 'var(--dash-accent)' }}
                    >
                      +{entry.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dash-panel">
          <div className="flex items-center justify-between border-b border-[color:var(--dash-border)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[color:var(--dash-text)]">Журнал решений ИИ</h2>
            <Link to="/ethics" className="dash-link">
              Все решения →
            </Link>
          </div>
          <ul className="divide-y divide-[color:var(--dash-border)]">
            {ethicsLog.slice(0, 3).map((decision) => (
              <li key={decision.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold"
                    style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
                  >
                    {decision.ruleId}
                  </span>
                  <span className="text-[10px] text-[color:var(--dash-muted)]">
                    {new Date(decision.ts).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--dash-text)]">{decision.summary}</p>
                <p className="mt-1 text-[10px] text-[color:var(--dash-muted)]">
                  {decision.valueIds.map((valueId) => getValueName(valueId)).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="dash-panel mt-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[color:var(--dash-text)]">Следующие шаги</h2>
            <p className="text-[11px] text-[color:var(--dash-muted)]">
              Рекомендации алгоритма с объяснением
            </p>
          </div>
          <Link to="/matcher" className="dash-link">
            Все задачи →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            {
              to: '/matcher',
              tag: 'Первенство',
              title: 'Откликнуться на задачу партнёра',
              text: 'В первой тройке есть задача на вырост — это правило MATCH-001.',
            },
            {
              to: '/twin',
              tag: 'Стремление к совершенству',
              title: 'Закрыть модуль из зоны роста',
              text: '+20 FinCoin за данные, которые улучшают курс для следующего потока.',
            },
            {
              to: '/wallet',
              tag: 'Коллаборация',
              title: 'Передать знание первокурсникам',
              text: 'Наставничество засчитывается после использования модуля другими.',
            },
          ].map((step) => (
            <Link
              key={step.to}
              to={step.to}
              className="rounded-lg border border-[color:var(--dash-border)] p-4 transition-colors hover:border-[color:var(--dash-accent)]"
            >
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[9px] font-medium"
                style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
              >
                🛡 {step.tag}
              </span>
              <p className="mt-2 text-sm font-medium text-[color:var(--dash-text)]">{step.title}</p>
              <p className="mt-1 text-[11px] text-[color:var(--dash-muted)]">{step.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DesktopDashboard;
