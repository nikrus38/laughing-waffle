import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PartnerTask, MatchResult, StudentTwin } from '../../../domain/types';

interface TaskPlanProps {
  task: PartnerTask;
  match: MatchResult;
  user: StudentTwin;
  onBackToStack: () => void;
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

const WEEKS = [
  { title: 'Неделя 1', text: 'Разобраться в данных и постановке задачи, согласовать критерии успеха.' },
  { title: 'Неделя 2', text: 'Собрать базовое решение и показать черновик наставнику.' },
  { title: 'Неделя 3', text: 'Усилить решение, проверить на тестовых примерах, исправить ошибки.' },
  { title: 'Неделя 4', text: 'Оформить результат и защитить его перед партнёром.' },
];

const TaskPlan: React.FC<TaskPlanProps> = ({ task, match, user, onBackToStack }) => {
  const navigate = useNavigate();

  const growth = Object.entries(task.required).map(([id, required]) => {
    const current = user.competencies[id as keyof StudentTwin['competencies']]?.level ?? 0;
    return {
      label: COMPETENCY_NAMES[id] ?? id,
      current: Math.round(current),
      required,
      gap: Math.max(0, required - current),
    };
  });

  return (
    <div>
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--mint-soft)', color: '#0b6b62' }}
      >
        <p className="text-xs font-medium">Отклик отправлен · демо</p>
        <h1 className="mt-1 text-base font-bold">План первого месяца</h1>
        <p className="mt-1 text-xs">{task.title}</p>
      </div>

      <ol className="mt-4 space-y-2">
        {WEEKS.map((week, index) => (
          <li key={week.title} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <span
                className="tnum flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: 'var(--brand)' }}
              >
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-[color:var(--ink)]">{week.title}</span>
            </div>
            <p className="mt-1.5 text-xs text-[color:var(--ink-muted)]">{week.text}</p>
          </li>
        ))}
      </ol>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Что вырастет в двойнике</h2>
        <ul className="mt-2 space-y-2">
          {growth.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-600">{item.label}</span>
              <span className="tnum text-slate-500">
                {item.current} → {Math.max(item.current, item.required)}
                {item.gap > 0 ? ` (+${item.gap})` : ' · уже хватает'}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-400">
          Прогноз демонстрационный: реальный прирост зависит от выполнения этапов.
        </p>
      </section>

      <p className="mt-3 text-[11px] text-slate-500">
        Совпадение {match.score}%{match.isStretch ? ' · задача на вырост' : ''}
      </p>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() => navigate('/twin')}
          className="min-h-[48px] w-full rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          Перейти к двойнику
        </button>
        <button
          type="button"
          onClick={onBackToStack}
          className="min-h-[44px] w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-700"
        >
          Вернуться к задачам
        </button>
      </div>
    </div>
  );
};

export default TaskPlan;
