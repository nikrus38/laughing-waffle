import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { partnerApi } from './api';
import {
  APPLICATION_STATUS_LABELS,
  STATUS_ORDER,
  type ApplicationStatus,
  type PartnerOverview,
} from './types';

const STATUS_TONE: Record<ApplicationStatus, string> = {
  new: 'bg-[color:var(--brand-soft)] text-[color:var(--brand)]',
  shortlisted: 'bg-[var(--gold-soft)] text-[#8a6209]',
  invited: 'bg-[var(--mint-soft)] text-[#056a78]',
  rejected: 'bg-slate-100 text-slate-500',
};

const PartnerHome: React.FC = () => {
  const [data, setData] = useState<PartnerOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await partnerApi.overview());
    } catch {
      setError('Не удалось загрузить сводку. Проверьте соединение и повторите.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const demandMax = useMemo(
    () => Math.max(1, ...(data?.demand.map((item) => item.count) ?? [1])),
    [data],
  );

  const changeStatus = async (id: number, status: ApplicationStatus) => {
    setBusyId(id);
    try {
      await partnerApi.setApplicationStatus(id, status);
      setData((current) =>
        current
          ? {
              ...current,
              applications: current.applications.map((item) =>
                item.id === id ? { ...item, status } : item,
              ),
              byStatus: current.applications.reduce(
                (acc, item) => {
                  const next = item.id === id ? status : item.status;
                  acc[next] += 1;
                  return acc;
                },
                { new: 0, shortlisted: 0, invited: 0, rejected: 0 } as Record<
                  ApplicationStatus,
                  number
                >,
              ),
            }
          : current,
      );
    } catch {
      setError('Статус не сохранился. Повторите действие.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Загружаем кабинет партнёра">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[color:var(--ink)]">Кабинет не открылся</p>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          Повторить
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Задач опубликовано', value: data.stats.tasks },
    { label: 'Набор открыт', value: data.stats.openTasks },
    { label: 'Откликов', value: data.stats.applications },
    { label: 'Студентов', value: data.stats.students },
  ];

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--ink)] lg:text-2xl">
            Кабинет партнёра
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[color:var(--ink-muted)]">
            Вы публикуете задачи и ведёте отклики. Студенты видят их в ИИ-свате, а платформа
            сама раскладывает задачу на учебные кейсы.
          </p>
        </div>
        <Link
          to="/partner/tasks/new"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Опубликовать задачу
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-white px-4 py-3">
            <p className="text-[10px] leading-tight text-slate-500">{item.label}</p>
            <p className="tnum mt-1 text-2xl font-semibold text-[color:var(--ink)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-[color:var(--ink)]">Отклики студентов</h2>
            <Link
              to="/partner/tasks"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-[color:var(--brand)]"
            >
              Мои задачи
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {data.applications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-[color:var(--ink)]">Откликов пока нет</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                Опубликуйте задачу — студенты увидят её в ИИ-свате и смогут откликнуться.
              </p>
            </div>
          ) : (
            <ul>
              {data.applications.map((application) => (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
                    aria-hidden="true"
                  >
                    {application.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xs font-semibold text-[color:var(--ink)]">
                        {application.student}
                      </p>
                      <span
                        className={[
                          'rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                          STATUS_TONE[application.status],
                        ].join(' ')}
                      >
                        {APPLICATION_STATUS_LABELS[application.status]}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      {application.course} курс · {application.taskTitle} · {application.createdAt}
                    </p>
                  </div>

                  <span
                    className="tnum rounded-lg px-2 py-1 text-[11px] font-semibold"
                    style={{ background: 'var(--mint-soft)', color: '#056a78' }}
                    title="Совпадение с требованиями задачи"
                  >
                    {application.match === null ? '—' : `${application.match}%`}
                  </span>

                  <select
                    value={application.status}
                    disabled={busyId === application.id}
                    onChange={(event) =>
                      void changeStatus(application.id, event.target.value as ApplicationStatus)
                    }
                    aria-label={`Статус отклика: ${application.student}`}
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2 text-[11px] text-slate-700 disabled:opacity-50"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {APPLICATION_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}

          {error && data && (
            <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-[11px] text-rose-700">
              {error}
            </p>
          )}
        </section>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-[color:var(--ink)]">
              Спрос на компетенции
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              По вашим задачам. Помогает понять, какие навыки вы просите чаще всего.
            </p>

            {data.demand.length === 0 ? (
              <p className="mt-3 text-[11px] text-slate-500">Пока нет требований по задачам.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {data.demand.map((item) => (
                  <li key={item.id}>
                    <div className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="tnum font-semibold text-[color:var(--ink)]">
                        {item.count}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((item.count / demandMax) * 100)}%`,
                          background: 'var(--mint)',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-[color:var(--ink)]">Воронка откликов</h2>
            <dl className="mt-2 space-y-1.5 text-[11px]">
              {STATUS_ORDER.map((status) => (
                <div key={status} className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">{APPLICATION_STATUS_LABELS[status]}</dt>
                  <dd className="tnum font-semibold text-[color:var(--ink)]">
                    {data.byStatus[status] ?? 0}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-snug text-slate-500">
              Статус отклика — это решение партнёра, а не оценка студента. Платформа показывает
              его студенту без комментариев.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PartnerHome;
