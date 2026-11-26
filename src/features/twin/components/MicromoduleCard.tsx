import React from 'react';
import { Micromodule } from '../../../domain/types';

interface MicromoduleCardProps {
  module: Micromodule;
  isCompleted: boolean;
  onComplete: () => void;
}

const COMPETENCY_NAMES: Record<string, string> = {
  data: 'Данные',
  code: 'Программирование',
  finance: 'Финансы',
  comm: 'Коммуникация',
  research: 'Исследования',
  entre: 'Предпринимательство',
  ai: 'ИИ',
  lead: 'Лидерство',
};

const KIND_LABELS: Record<Micromodule['kind'], string> = {
  learn: 'Обучение',
  practice: 'Практика',
  mentor: 'Наставничество',
};

const MicromoduleCard: React.FC<MicromoduleCardProps> = ({ module, isCompleted, onComplete }) => {
  const gains = Object.entries(module.gains).map(([id, gain]) => ({
    name: COMPETENCY_NAMES[id] ?? id,
    gain: gain ?? 0,
  }));

  const difficultyStyle =
    module.difficulty <= 2
      ? { background: 'var(--mint-soft)', color: '#0b6b62' }
      : module.difficulty === 3
        ? { background: 'var(--gold-soft)', color: '#8a6209' }
        : { background: '#fde8e6', color: 'var(--danger)' };

  return (
    <article className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-[color:var(--ink)]">{module.title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {module.minutes} мин · {KIND_LABELS[module.kind]}
          </p>
        </div>
        <span
          className="tnum shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={difficultyStyle}
        >
          {module.difficulty}/5
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {gains.map((gain) => (
          <span
            key={gain.name}
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            +{gain.gain} {gain.name}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={isCompleted}
        className={[
          'mt-3 min-h-[44px] w-full rounded-xl text-sm font-semibold transition-colors',
          isCompleted
            ? 'cursor-default bg-slate-100 text-slate-500'
            : 'text-white hover:opacity-90',
        ].join(' ')}
        style={isCompleted ? undefined : { background: 'var(--brand)' }}
      >
        {isCompleted ? 'Модуль пройден' : 'Начать модуль'}
      </button>
    </article>
  );
};

export default MicromoduleCard;
