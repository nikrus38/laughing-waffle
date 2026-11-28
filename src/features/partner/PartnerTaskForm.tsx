import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { partnerApi } from './api';
import type { TaskDraft } from './types';

const COMPETENCIES: Array<{ id: string; label: string }> = [
  { id: 'data', label: 'Данные' },
  { id: 'code', label: 'Программирование' },
  { id: 'finance', label: 'Финансы и экономика' },
  { id: 'comm', label: 'Коммуникация' },
  { id: 'research', label: 'Исследование' },
  { id: 'entre', label: 'Предпринимательство' },
  { id: 'ai', label: 'ИИ-грамотность' },
  { id: 'lead', label: 'Лидерство' },
];

const EMPTY: TaskDraft = {
  title: '',
  summary: '',
  difficulty: 3,
  weeks: 6,
  tags: [],
  required: {},
};

const inputClass =
  'min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-[color:var(--ink)] transition-colors placeholder:text-slate-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15';

const PartnerTaskForm: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const competencies = COMPETENCIES;

  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(Boolean(code));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    partnerApi
      .task(code)
      .then((payload) => {
        if (cancelled || !payload) return;
        const task = payload.task;
        setDraft({
          title: task.title,
          summary: task.summary,
          difficulty: task.difficulty,
          weeks: task.weeks,
          tags: task.tags,
          required: task.required,
        });
      })
      .catch(() => {
        if (!cancelled) setError('Задача не открылась. Вернитесь к списку и попробуйте снова.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const titleError = draft.title.trim().length > 0 && draft.title.trim().length < 5;
  const summaryError = draft.summary.trim().length > 0 && draft.summary.trim().length < 20;

  const requiredList = useMemo(
    () =>
      Object.entries(draft.required)
        .filter(([, level]) => level > 0)
        .sort((a, b) => b[1] - a[1]),
    [draft.required],
  );

  const patch = (changes: Partial<TaskDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setError(null);
  };

  const setLevel = (id: string, value: number) => {
    setDraft((current) => {
      const next = { ...current.required };
      if (value <= 0) delete next[id];
      else next[id] = value;
      return { ...current, required: next };
    });
  };

  const addTag = () => {
    const value = tagInput.trim().slice(0, 24);
    if (!value || draft.tags.includes(value) || draft.tags.length >= 6) {
      if (draft.tags.length >= 6) setError('Больше шести тегов не нужно: студенту сложнее ориентироваться.');
      setTagInput('');
      return;
    }
    patch({ tags: [...draft.tags, value] });
    setTagInput('');
  };

  const save = async () => {
    if (draft.title.trim().length < 5) {
      setError('Название короче пяти символов.');
      return;
    }
    if (draft.summary.trim().length < 20) {
      setError('Описание короче двадцати символов — студенту не хватит контекста.');
      return;
    }
    if (Object.keys(draft.required).length === 0) {
      setError('Отметьте хотя бы одну компетенцию: без требований задача не попадёт в матчинг.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (code) await partnerApi.updateTask(code, draft);
      else await partnerApi.createTask(draft);
      navigate('/partner/tasks');
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : 'Задача не сохранилась. Проверьте поля и повторите.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" aria-busy="true" />;
  }

  return (
    <div>
      <Link
        to="/partner/tasks"
        className="mb-3 inline-flex min-h-[36px] items-center gap-1.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-[color:var(--brand)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Мои задачи
      </Link>

      <header className="mb-4">
        <h1 className="text-xl font-bold text-[color:var(--ink)] lg:text-2xl">
          {code ? 'Задача партнёра' : 'Новая задача'}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-[color:var(--ink-muted)]">
          Опишите запрос так, как рассказали бы кафедре. Дальше платформа сама покажет его
          студентам и разложит на учебные кейсы.
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700">
            Название задачи
          </label>
          <input
            id="task-title"
            type="text"
            value={draft.title}
            maxLength={200}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Например, прогноз оттока клиентов"
            aria-invalid={titleError}
            className={[inputClass, 'mt-1.5', titleError ? 'border-[color:var(--danger)]' : ''].join(' ')}
          />
          <p className="mt-1.5 text-[11px] text-slate-500">
            {titleError ? 'Нужно минимум пять символов.' : 'Коротко и по делу: это первая строка карточки.'}
          </p>

          <label
            htmlFor="task-summary"
            className="mt-4 block text-xs font-semibold text-slate-700"
          >
            Что нужно сделать
          </label>
          <textarea
            id="task-summary"
            value={draft.summary}
            rows={5}
            maxLength={2000}
            onChange={(event) => patch({ summary: event.target.value })}
            placeholder="Контекст, данные, ожидаемый результат и что считается успехом."
            aria-invalid={summaryError}
            className={[
              inputClass,
              'mt-1.5 min-h-[120px] resize-y py-2.5',
              summaryError ? 'border-[color:var(--danger)]' : '',
            ].join(' ')}
          />
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              {summaryError
                ? 'Нужно минимум двадцать символов.'
                : 'Без персональных данных и названий реальных компаний.'}
            </p>
            <span className="tnum text-[10px] text-slate-400">{draft.summary.length}/2000</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-semibold text-slate-700">Сложность</span>
              <div
                className="mt-1.5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                role="group"
                aria-label="Сложность задачи"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => patch({ difficulty: level })}
                    aria-pressed={draft.difficulty === level}
                    className={[
                      'min-h-[36px] w-9 rounded-[10px] text-xs font-semibold transition-colors',
                      draft.difficulty === level
                        ? 'bg-white text-[color:var(--brand)] shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-[color:var(--ink)]',
                    ].join(' ')}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="task-weeks" className="block text-xs font-semibold text-slate-700">
                Срок, недель
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="task-weeks"
                  type="range"
                  min={1}
                  max={24}
                  value={draft.weeks}
                  onChange={(event) => patch({ weeks: Number(event.target.value) })}
                  className="range w-full"
                />
                <span className="tnum w-10 text-right text-sm font-semibold text-[color:var(--ink)]">
                  {draft.weeks}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <span className="block text-xs font-semibold text-slate-700">Теги</span>
            <p className="mt-1 text-[11px] text-slate-500">
              По тегам студенты находят задачу, а декомпозиция собирает кейсы.
            </p>

            {draft.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-[11px] text-slate-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => patch({ tags: draft.tags.filter((item) => item !== tag) })}
                      aria-label={`Убрать тег «${tag}»`}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  addTag();
                }}
                placeholder="Например, риск-аналитика"
                aria-label="Новый тег"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white disabled:opacity-40"
                style={{ background: 'var(--brand)' }}
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                Добавить
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <span className="block text-xs font-semibold text-slate-700">
              Требуемые компетенции
            </span>
            <p className="mt-1 text-[11px] text-slate-500">
              Отметьте уровень, с которым студент справится. Ноль — навык не требуется.
            </p>

            <ul className="mt-3 space-y-2.5">
              {competencies.map((competency) => {
                const level = draft.required[competency.id] ?? 0;
                return (
                  <li key={competency.id} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-[11.5px] text-slate-600">
                      {competency.label}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={level}
                      onChange={(event) => setLevel(competency.id, Number(event.target.value))}
                      aria-label={`Требование: ${competency.label}`}
                      className={level > 0 ? 'range w-full' : 'range is-empty w-full'}
                    />
                    <span className="tnum w-9 shrink-0 text-right text-[11px] font-semibold text-[color:var(--ink)]">
                      {level > 0 ? level : '—'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="min-h-[44px] rounded-xl px-5 text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--brand)' }}
            >
              {saving ? 'Сохраняем…' : code ? 'Сохранить изменения' : 'Опубликовать задачу'}
            </button>
            <Link
              to="/partner/tasks"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 px-4 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Отменить
            </Link>
          </div>
        </section>

        <aside className="lg:sticky lg:top-[112px]">
          <p className="mb-2 text-[11px] font-medium text-slate-500">Как увидят студенты</p>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold leading-snug text-[color:var(--ink)]">
                {draft.title.trim() || 'Название задачи'}
              </h2>
              <span className="tnum shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--gold-soft)', color: '#8a6209' }}>
                {draft.difficulty}/5
              </span>
            </div>

            <p className="mt-2 line-clamp-4 text-[11.5px] leading-snug text-slate-600">
              {draft.summary.trim() || 'Описание появится здесь, как только вы его напишете.'}
            </p>

            <div className="mt-3 flex flex-wrap gap-1">
              {requiredList.length === 0 ? (
                <span className="text-[10.5px] text-slate-400">Компетенции не выбраны</span>
              ) : (
                requiredList.map(([id, level]) => (
                  <span
                    key={id}
                    className="rounded-full bg-[color:var(--brand-soft)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--brand)]"
                  >
                    {COMPETENCIES.find((item) => item.id === id)?.label ?? id}: {level}
                  </span>
                ))
              )}
            </div>

            {draft.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] text-slate-500">
              <span>Крупный банк (пример)</span>
              <span className="tnum">{draft.weeks} нед.</span>
            </div>
          </article>

          <p className="mt-3 text-[10.5px] leading-snug text-slate-500">
            Процент совпадения студент увидит сам: 40% навыки, 30% зона роста, 20% интересы,
            10% свободные часы.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default PartnerTaskForm;
