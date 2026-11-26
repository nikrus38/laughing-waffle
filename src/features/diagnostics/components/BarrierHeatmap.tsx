import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../shared/store/useStore';
import { Barrier } from '../../../domain/types';

const CATEGORIES: Array<{ id: Barrier['category']; name: string; short: string }> = [
  { id: 'administrative', name: 'Административные', short: 'Адм.' },
  { id: 'informational', name: 'Информационные', short: 'Инф.' },
  { id: 'cultural', name: 'Культурные', short: 'Культ.' },
];

const STAGES: Array<{ id: Barrier['stage']; name: string; short: string }> = [
  { id: 'search', name: 'Поиск партнёра', short: 'Поиск' },
  { id: 'agreement', name: 'Согласование', short: 'Согл.' },
  { id: 'launch', name: 'Запуск проекта', short: 'Запуск' },
  { id: 'evaluation', name: 'Оценка результата', short: 'Оценка' },
  { id: 'scale', name: 'Масштабирование', short: 'Масштаб' },
];

// Куда ведёт решение барьера в продукте
const SOLUTION: Record<string, { label: string; to: string }> = {
  matcher: { label: 'ИИ-сват', to: '/matcher' },
  twin: { label: 'Цифровой двойник', to: '/twin' },
  wallet: { label: 'Кошелёк FinCoin', to: '/wallet' },
  ethics: { label: 'Этика ИИ', to: '/ethics' },
  decomposer: { label: 'Декомпозиция задач', to: '/decomposer' },
  patents: { label: 'Радар патентов', to: '/patents' },
  trajectory: { label: 'Траектория', to: '/trajectory' },
  diagnostics: { label: 'Диагностика', to: '/diagnostics' },
  home: { label: 'Главная', to: '/' },
};

const SEVERITY_STYLE = [
  { background: '#eef2f8', color: '#5a6b82' },
  { background: '#e0f5f2', color: '#0b6b62' },
  { background: '#fdf3dc', color: '#8a6209' },
  { background: '#fde8e6', color: '#b42318' },
];

interface Cell {
  category: Barrier['category'];
  stage: Barrier['stage'];
  severity: number;
  barriers: Barrier[];
}

const BarrierHeatmap: React.FC = () => {
  const [selected, setSelected] = useState<Cell | null>(null);
  const barriersSource = useStore((state) => state.barriers);

  const cells: Cell[] = CATEGORIES.flatMap((category) =>
    STAGES.map((stage) => {
      const barriers = barriersSource.filter(
        (barrier) => barrier.category === category.id && barrier.stage === stage.id,
      );
      const severity =
        barriers.length === 0
          ? 0
          : Math.round(barriers.reduce((sum, b) => sum + b.severity, 0) / barriers.length);
      return { category: category.id, stage: stage.id, severity, barriers };
    }),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-[color:var(--ink)]">Тепловая карта барьеров</h2>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ background: 'var(--brand-soft)' }}>
          <p className="tnum text-2xl font-bold" style={{ color: 'var(--brand)' }}>
            34,7%
          </p>
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: '#173a5e' }}>
            кооперация с вузами
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'var(--mint-soft)' }}>
          <p className="tnum text-2xl font-bold" style={{ color: '#0b6b62' }}>
            55%
          </p>
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: '#0b6b62' }}>
            кооперация с поставщиками
          </p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Цифры из исходных данных задания. Интенсивность ячеек — экспертная оценка команды, не
        результат исследования.
      </p>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
        <span>Барьер:</span>
        {[0, 1, 2, 3].map((severity) => (
          <span key={severity} className="flex items-center gap-1">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: SEVERITY_STYLE[severity]!.background }}
              aria-hidden="true"
            />
            {severity}
          </span>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-10" />
              {STAGES.map((stage) => (
                <th
                  key={stage.id}
                  scope="col"
                  className="p-0 text-[9px] font-medium text-slate-500"
                  title={stage.name}
                >
                  {stage.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((category) => (
              <tr key={category.id}>
                <th
                  scope="row"
                  className="w-10 p-0 text-left text-[9px] font-medium text-slate-500"
                  title={category.name}
                >
                  {category.short}
                </th>
                {STAGES.map((stage) => {
                  const cell = cells.find(
                    (item) => item.category === category.id && item.stage === stage.id,
                  )!;
                  const style = SEVERITY_STYLE[cell.severity] ?? SEVERITY_STYLE[0]!;
                  return (
                    <td key={stage.id} className="p-0">
                      <button
                        type="button"
                        onClick={() => setSelected(cell)}
                        aria-label={`${category.name}, ${stage.name}: интенсивность ${cell.severity}, барьеров ${cell.barriers.length}`}
                        className="flex h-11 w-full items-center justify-center rounded-lg text-xs font-semibold transition-transform active:scale-95"
                        style={{ background: style.background, color: style.color }}
                      >
                        {cell.severity > 0 ? cell.severity : '—'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        Нажмите на ячейку — покажем, что это за барьер и чем его снимает Университет 4.0.
      </p>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="barrier-title"
        >
          <div className="max-h-[70vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              {CATEGORIES.find((c) => c.id === selected.category)?.name} ·{' '}
              {STAGES.find((s) => s.id === selected.stage)?.name}
            </p>
            <h3 id="barrier-title" className="mt-1 text-base font-bold text-[color:var(--ink)]">
              {selected.barriers.length > 0
                ? selected.barriers.map((b) => b.title).join(' · ')
                : 'Барьера не отмечено'}
            </h3>

            {selected.barriers.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {selected.barriers.map((barrier) => {
                  const solution = SOLUTION[barrier.solvedBy];
                  return (
                    <li key={barrier.id} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-[color:var(--ink)]">
                        {barrier.title}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">{barrier.note}</p>
                      {solution && (
                        <Link
                          to={solution.to}
                          onClick={() => setSelected(null)}
                          className="mt-2 inline-flex min-h-[36px] items-center text-[11px] font-semibold text-[color:var(--brand)]"
                        >
                          Снимается модулем «{solution.label}» →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                В этой ячейке команда не отметила значимых барьеров.
              </p>
            )}

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 min-h-[44px] w-full rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--brand)' }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BarrierHeatmap;
