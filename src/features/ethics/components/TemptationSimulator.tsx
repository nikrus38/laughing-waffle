import React, { useState } from 'react';
import { getValueName } from '../../../data/values';

/**
 * Симулятор искушения: ползунок «хочу баллы побыстрее»,
 * но алгоритм всё равно предлагает путь развития.
 */
const TemptationSimulator: React.FC = () => {
  const [level, setLevel] = useState(50);

  const effect =
    level < 30
      ? 'Спокойный темп: хочется разобраться, а не закрыть галочку'
      : level < 70
        ? 'Умеренный азарт: баллы уже заметны, но развитие важнее'
        : 'Сильное искушение: хочется быстрых баллов любой ценой';

  const recommendation =
    level < 70
      ? {
          title: 'Путь развития',
          text: 'Алгоритм предлагает микромодуль из зоны ближайшего развития и задачу на вырост — они дают рост, а не только монеты.',
          values: ['excellence', 'excellence2'],
        }
      : {
          title: 'Этичный выбор',
          text: 'Даже при максимальном искушении система не поднимает в топ лёгкие задачи с большой наградой. Самый простой вариант вытесняется задачей на вырост, а причина записывается в журнал.',
          values: ['excellence', 'integrity'],
        };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-[color:var(--ink)]">Симулятор искушения</h2>
      <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
        Потяните ползунок: посмотрите, меняет ли жадность до баллов рекомендации.
      </p>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Хочу развиваться</span>
          <span>Хочу баллы быстро</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={level}
          onChange={(event) => setLevel(Number(event.target.value))}
          aria-label="Уровень желания набрать баллы побыстрее"
          className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[color:var(--brand)]"
        />
        <p className="tnum mt-2 text-center text-lg font-bold text-[color:var(--brand)]">{level}%</p>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Что происходит
        </p>
        <p className="mt-1 text-xs text-slate-700">{effect}</p>
      </div>

      <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--mint-soft)' }}>
        <p className="text-xs font-semibold" style={{ color: '#0b6b62' }}>
          Рекомендация системы: {recommendation.title}
        </p>
        <p className="mt-1 text-xs text-[color:var(--ink)]">{recommendation.text}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {recommendation.values.map((valueId) => (
            <span
              key={valueId}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
            >
              🛡 {getValueName(valueId)}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Правила WALLET-001 и MATCH-001 не дают алгоритму подменить развитие охотой за наградой.
        FinCoin — след вклада, а не цель.
      </p>
    </section>
  );
};

export default TemptationSimulator;
