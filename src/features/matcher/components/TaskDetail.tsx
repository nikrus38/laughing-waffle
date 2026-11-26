import React from 'react';
import { PartnerTask, MatchResult } from '../../../domain/types';

interface TaskDetailProps {
  task: PartnerTask;
  match: MatchResult;
  onBack: () => void;
  onApply: () => void;
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

const TaskDetail: React.FC<TaskDetailProps> = ({ task, match, onBack, onApply }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 min-h-[44px] text-sm font-medium text-[color:var(--brand)]"
      >
        ← Назад к задачам
      </button>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-base font-bold text-[color:var(--ink)]">{task.title}</h1>
          <span
            className="tnum shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
            style={{ background: 'var(--mint-soft)', color: '#0b6b62' }}
          >
            {match.score}%
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {task.partnerLabel} · {task.weeks} нед. · сложность {task.difficulty}/5
        </p>
        <p className="mt-3 text-sm text-[color:var(--ink)]">{task.summary}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {Object.entries(task.required).map(([id, level]) => (
            <span
              key={id}
              className="rounded px-2 py-1 text-[11px]"
              style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
            >
              {COMPETENCY_NAMES[id] ?? id}: {level}
            </span>
          ))}
        </div>

        {match.isStretch && (
          <div className="mt-3 rounded-xl p-3 text-xs" style={{ background: 'var(--gold-soft)', color: '#8a6209' }}>
            Задача на вырост: разрыв по одной из компетенций больше 25 пунктов. Это нормальный
            вызов, а не ошибка подбора.
          </div>
        )}
      </article>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Почему задача подходит</h2>
        <ul className="mt-2 space-y-2">
          {match.factors.map((factor) => (
            <li key={factor.label}>
              <div className="flex justify-between text-xs text-slate-600">
                <span>{factor.label}</span>
                <span className="tnum">{Math.round(factor.value * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${factor.value * 100}%`, background: 'var(--mint)' }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-slate-500">{match.explanation}</p>
        <p className="mt-2 text-[11px] text-slate-400">
          Пол, возраст, происхождение и средний балл в расчёте не участвуют.
        </p>
      </section>

      <button
        type="button"
        onClick={onApply}
        className="mt-4 min-h-[48px] w-full rounded-xl text-sm font-semibold text-white"
        style={{ background: 'var(--brand)' }}
      >
        Откликнуться на задачу
      </button>
    </div>
  );
};

export default TaskDetail;
