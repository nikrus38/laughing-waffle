import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { partnerApi } from './api';
import type { PartnerTask, TaskStatus } from './types';

type Filter = 'all' | TaskStatus;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'open', label: 'Набор открыт' },
  { id: 'closed', label: 'Набор закрыт' },
];

const PartnerTasks: React.FC = () => {
  const [tasks, setTasks] = useState<PartnerTask[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await partnerApi.tasks();
      setTasks(payload.tasks);
    } catch {
      setError('Не удалось загрузить задачи. Повторите попытку.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (task: PartnerTask) => {
    setBusy(task.id);
    try {
      const next = task.status === 'open' ? 'closed' : 'open';
      const payload = await partnerApi.toggleTask(task.id, next);
      setTasks((current) => current.map((item) => (item.id === task.id ? payload.task : item)));
    } catch {
      setError('Статус не изменился. Повторите действие.');
    } finally {
      setBusy(null);
    }
  };

  const visible = tasks.filter((task) => filter === 'all' || task.status === filter);

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--ink)] lg:text-2xl">Мои задачи</h1>
          <p className="mt-1 max-w-xl text-sm text-[color:var(--ink-muted)]">
            Задачу видят студенты в ИИ-свате, пока набор открыт. Закрытые задачи остаются
            в истории и в декомпозиции.
          </p>
        </div>
        <Link
          to="/partner/tasks/new"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Новая задача
        </Link>
      </header>

      <div
        className="mb-3 inline-flex rounded-xl border border-slate-200 bg-white p-0.5"
        role="group"
        aria-label="Фильтр задач"
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className={[
              'min-h-[36px] rounded-[10px] px-3 text-[11px] font-medium transition-colors',
              filter === item.id
                ? 'bg-[color:var(--brand-soft)] text-[color:var(--brand)]'
                : 'text-slate-500 hover:text-[color:var(--ink)]',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-[color:var(--ink)]">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
            style={{ background: 'var(--brand)' }}
          >
            <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
            Повторить
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center">
          <p className="text-sm font-medium text-[color:var(--ink)]">Здесь пока пусто</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            {filter === 'all'
              ? 'Опубликуйте первую задачу — она появится в подборке у студентов.'
              : 'В этом фильтре задач нет — переключите фильтр или создайте новую.'}
          </p>
          <Link
            to="/partner/tasks/new"
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
            style={{ background: 'var(--brand)' }}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Опубликовать задачу
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((task) => (
            <li
              key={task.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-[color:var(--ink)]">
                      {task.title}
                    </h2>
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-[9px] font-medium',
                        task.status === 'open'
                          ? 'bg-[var(--mint-soft)] text-[#056a78]'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {task.status === 'open' ? 'набор открыт' : 'набор закрыт'}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 max-w-2xl text-[11.5px] leading-snug text-slate-600">
                    {task.summary}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-500">
                    <span className="tnum">сложность {task.difficulty}/5</span>
                    <span className="tnum">{task.weeks} нед.</span>
                    <span className="tnum">{task.applicationsCount} откликов</span>
                    <span>от {task.createdAt}</span>
                  </div>

                  {task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    to={`/partner/tasks/${task.id}`}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Изменить
                  </Link>
                  <button
                    type="button"
                    onClick={() => void toggle(task)}
                    disabled={busy === task.id}
                    className="min-h-[36px] rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-50"
                  >
                    {busy === task.id ? '…' : task.status === 'open' ? 'Закрыть' : 'Открыть'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PartnerTasks;
