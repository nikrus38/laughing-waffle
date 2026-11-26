import React from 'react';
import { PartnerTask, MatchResult } from '../../../domain/types';

interface TaskCardProps {
  task: PartnerTask;
  match: MatchResult;
  onOpen?: () => void;
}

const COMPETENCY_NAMES: Record<string, string> = {
  data: 'Данные',
  code: 'Код',
  finance: 'Финансы',
  comm: 'Общение',
  research: 'Наука',
  entre: 'Бизнес',
  ai: 'ИИ',
  lead: 'Лидерство',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, match, onOpen }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">{task.title}</h3>
        {match.isStretch && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: 'var(--gold-soft)', color: '#8a6209' }}
          >
            на вырост
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-[color:var(--ink-muted)]">{task.summary}</p>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
        <span>{task.partnerLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{task.weeks} нед.</span>
        <span aria-hidden="true">·</span>
        <span>сложность {task.difficulty}/5</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(task.required).map(([id, level]) => (
          <span
            key={id}
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            {COMPETENCY_NAMES[id] ?? id}: {level}
          </span>
        ))}
      </div>

      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 min-h-[40px] w-full rounded-xl border border-slate-300 text-xs font-semibold text-[color:var(--brand)]"
        >
          Подробнее о задаче
        </button>
      )}
    </div>
  );
};

export default TaskCard;
