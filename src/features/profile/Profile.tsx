import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../shared/api/client';
import { useStore } from '../../shared/store/useStore';
import {
  HOURS_MAX,
  HOURS_MIN,
  INTEREST_LIMIT,
  addInterest,
  clampHours,
  initialsOf,
  isDraftDirty,
  normalizeName,
  removeInterest,
  validateName,
  type Course,
  type ProfileDraft,
} from '../../domain/profile';

type SaveState = 'idle' | 'saving' | 'error';

const COURSES: Course[] = [1, 2, 3, 4];

const draftFromStore = (
  displayName: string,
  course: Course,
  interests: string[],
  weeklyHours: number,
): ProfileDraft => ({ displayName, course, interests: [...interests], weeklyHours });

const inputClass =
  'min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-[color:var(--ink)] transition-colors placeholder:text-slate-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/15';

const Profile: React.FC = () => {
  const user = useStore((s) => s.user);
  const userRole = useStore((s) => s.userRole);
  const mode = useStore((s) => s.mode);
  const account = useStore((s) => s.account);
  const tasks = useStore((s) => s.availableTasks);
  const updateProfile = useStore((s) => s.updateProfile);

  const [saved, setSaved] = useState<ProfileDraft>(() =>
    draftFromStore(user.displayName, user.course, user.interests, user.weeklyHours),
  );
  const [draft, setDraft] = useState<ProfileDraft>(saved);
  const [interestInput, setInterestInput] = useState('');
  const [interestError, setInterestError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const dirty = isDraftDirty(draft, saved);
  const nameError = validateName(draft.displayName);

  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 2600);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const suggestions = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach((task) => task.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags)
      .filter((tag) => !draft.interests.some((item) => item.toLowerCase() === tag.toLowerCase()))
      .slice(0, 4);
  }, [tasks, draft.interests]);

  const patch = (changes: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setError(null);
    setState('idle');
  };

  const add = (value: string) => {
    const result = addInterest(draft.interests, value);
    setInterestError(result.error ?? null);
    if (result.list !== draft.interests) {
      patch({ interests: result.list });
      setInterestInput('');
    }
  };

  const remove = (value: string) => {
    setInterestError(null);
    patch({ interests: removeInterest(draft.interests, value) });
  };

  const reset = () => {
    setDraft(saved);
    setInterestInput('');
    setInterestError(null);
    setError(null);
    setState('idle');
  };

  const save = async () => {
    if (nameError) {
      setError(nameError);
      setState('error');
      return;
    }

    setState('saving');
    setError(null);

    const next: ProfileDraft = {
      displayName: normalizeName(draft.displayName),
      course: draft.course,
      interests: draft.interests,
      weeklyHours: clampHours(draft.weeklyHours),
    };

    const result = await updateProfile({
      displayName: next.displayName,
      course: next.course,
      interests: next.interests,
      weeklyHours: next.weeklyHours,
    });

    if (!result.ok) {
      setState('error');
      setError(result.reason ?? 'Не удалось сохранить профиль.');
      return;
    }

    setSaved(next);
    setDraft(next);
    setState('idle');
    setJustSaved(true);
  };

  const switchProfile = (target: 'student' | 'partner') => {
    window.location.assign(target === 'partner' ? '/demo-login/partner/' : '/demo-login/');
  };

  const logout = async () => {
    try {
      if (mode === 'server') await api.post('/logout/');
    } catch {
      /* уводим на публичную страницу в любом случае */
    }
    window.location.assign('/');
  };

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--ink)] lg:text-2xl">Профиль</h1>
          <p className="mt-1 max-w-lg text-sm text-[color:var(--ink-muted)]">
            Имя, курс и интересы видны в ленте FinCoin и в откликах на задачи. Интересы
            и свободные часы напрямую влияют на подбор задач.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-500">
          демо-профиль, данные вымышленные
        </span>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-5">
        <div>
          <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3.5 border-b border-slate-100 p-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
                aria-hidden="true"
              >
                {initialsOf(draft.displayName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[color:var(--ink)]">
                  {normalizeName(draft.displayName) || 'Без имени'}
                </p>
                <p className="text-xs text-slate-500">
                  {draft.course} курс ·{' '}
                  {userRole === 'student' ? 'студент' : 'партнёр и кафедра'}
                </p>
              </div>
            </div>

            <div className="p-4">
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Отображаемое имя
              </label>
              <div className="relative mt-1.5">
                <input
                  id="profile-name"
                  type="text"
                  value={draft.displayName}
                  onChange={(event) => patch({ displayName: event.target.value })}
                  maxLength={60}
                  autoComplete="name"
                  aria-invalid={Boolean(nameError)}
                  aria-describedby="profile-name-hint"
                  className={[
                    inputClass,
                    nameError ? 'border-[color:var(--danger)]' : '',
                    'pr-14',
                  ].join(' ')}
                />
                <span className="tnum pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  {normalizeName(draft.displayName).length}/60
                </span>
              </div>
              <p
                id="profile-name-hint"
                className={[
                  'mt-1.5 text-[11px]',
                  nameError ? 'text-[color:var(--danger)]' : 'text-slate-500',
                ].join(' ')}
              >
                {nameError ?? 'Так вас увидят наставники и партнёры в откликах.'}
              </p>
            </div>

            <div className="border-t border-slate-100 p-4">
              <span className="block text-xs font-semibold text-slate-700">Курс</span>
              <div
                className="mt-1.5 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                role="group"
                aria-label="Курс обучения"
              >
                {COURSES.map((course) => {
                  const active = draft.course === course;
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => patch({ course })}
                      aria-pressed={active}
                      className={[
                        'min-h-[38px] min-w-[46px] rounded-[10px] px-3 text-xs font-semibold transition-colors',
                        active
                          ? 'bg-white text-[color:var(--brand)] shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:text-[color:var(--ink)]',
                      ].join(' ')}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Курс влияет на то, какие кейсы предлагает декомпозиция задач.
              </p>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-[color:var(--ink)]">
                Интересы для матчинга
              </h2>
              <span className="tnum text-[10px] text-slate-400">
                {draft.interests.length} из {INTEREST_LIMIT}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              Совпадение с тегами задачи (interestFit) считается по этому списку. Чем точнее
              интересы, тем меньше случайных задач в подборке.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-[11px] font-medium text-[color:var(--ink)]"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => remove(interest)}
                    aria-label={`Убрать интерес «${interest}»`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}

              {draft.interests.length === 0 && (
                <span className="text-[11px] text-slate-500">
                  Пока пусто — матчинг будет опираться только на компетенции.
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={interestInput}
                placeholder="Например, финтех"
                aria-label="Новый интерес"
                maxLength={24}
                onChange={(event) => {
                  setInterestInput(event.target.value);
                  setInterestError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  add(interestInput);
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => add(interestInput)}
                disabled={!interestInput.trim()}
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: 'var(--brand)' }}
              >
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                Добавить
              </button>
            </div>

            <p
              className={[
                'mt-1.5 min-h-[16px] text-[11px]',
                interestError ? 'text-[color:var(--danger)]' : 'text-slate-500',
              ].join(' ')}
              aria-live="polite"
            >
              {interestError ?? 'Enter добавляет интерес, не больше восьми.'}
            </p>

            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-medium text-slate-400">Из задач партнёров</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {suggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => add(tag)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                    >
                      <PlusIcon className="h-3 w-3" aria-hidden="true" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-[color:var(--ink)]">Свободные часы</h2>
              <span className="tnum text-sm font-semibold text-[color:var(--ink)]">
                {draft.weeklyHours} ч/нед
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              Сколько времени вы готовы отдать проекту. По этому значению считается loadFit:
              задача с нереальным сроком получит меньший процент.
            </p>

            <input
              type="range"
              min={HOURS_MIN}
              max={HOURS_MAX}
              step={1}
              value={draft.weeklyHours}
              onChange={(event) => patch({ weeklyHours: clampHours(Number(event.target.value)) })}
              aria-label="Свободные часы в неделю"
              className="mt-4 w-full"
              style={{ accentColor: 'var(--brand)' }}
            />
            <div className="tnum mt-1 flex justify-between text-[10px] text-slate-400">
              <span>{HOURS_MIN} ч</span>
              <span>{HOURS_MAX} ч</span>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-[color:var(--ink)]">Демо-профиль</h2>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              Студент и партнёр — разные аккаунты с отдельными данными. Переключение
              перезагружает консоль и входит в выбранный профиль.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                {
                  key: 'student' as const,
                  title: 'Студент',
                  hint: 'Александр Петров · 1 курс',
                },
                {
                  key: 'partner' as const,
                  title: 'Партнёр и кафедра',
                  hint: 'Марина Соколова · Крупный банк (пример)',
                },
              ].map((item) => {
                const active = userRole === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => switchProfile(item.key)}
                    disabled={active}
                    aria-pressed={active}
                    className={[
                      'flex min-h-[58px] flex-col items-start justify-center gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors',
                      active
                        ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="text-xs font-semibold text-[color:var(--ink)]">
                      {item.title}
                    </span>
                    <span className="text-[10px] leading-snug text-slate-500">{item.hint}</span>
                    <span className="text-[10px] font-medium text-[color:var(--brand)]">
                      {active ? 'текущий профиль' : 'переключиться →'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {(dirty || state === 'error') && (
            <div className="fixed inset-x-4 bottom-[calc(82px+env(safe-area-inset-bottom))] z-20 lg:static lg:mt-4 lg:inset-auto">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_16px_38px_-20px_rgba(11,31,58,0.55)]">
                <p
                  className={[
                    'min-w-0 flex-1 px-1 text-[11px] leading-snug',
                    state === 'error' ? 'text-[color:var(--danger)]' : 'text-slate-500',
                  ].join(' ')}
                  aria-live="polite"
                >
                  {state === 'error' ? error : 'Есть несохранённые изменения.'}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-[40px] rounded-xl border border-slate-300 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Отменить
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={state === 'saving' || Boolean(nameError)}
                  className="min-h-[40px] rounded-xl px-4 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ background: 'var(--brand)' }}
                >
                  {state === 'saving' ? 'Сохраняем…' : 'Сохранить'}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[112px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-semibold text-slate-700">Так вас видно</h2>
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: 'var(--brand)' }}
                aria-hidden="true"
              >
                {initialsOf(draft.displayName)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-[color:var(--ink)]">
                  {normalizeName(draft.displayName) || 'Без имени'}
                </span>
                <span className="block truncate text-[10px] text-slate-500">
                  {draft.course} курс · Финансовый университет
                </span>
              </span>
            </div>

            <dl className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Интересы</dt>
                <dd className="text-right font-medium text-[color:var(--ink)]">
                  {draft.interests.length > 0 ? draft.interests.slice(0, 3).join(', ') : '—'}
                  {draft.interests.length > 3 && ` +${draft.interests.length - 3}`}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Часы в неделю</dt>
                <dd className="tnum font-medium text-[color:var(--ink)]">{draft.weeklyHours} ч</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Профиль</dt>
                <dd className="font-medium text-[color:var(--ink)]">
                  {userRole === 'student' ? 'Студент' : 'Партнёр'}
                </dd>
              </div>
            </dl>

            <Link
              to="/twin"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              Посмотреть компетенции
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-semibold text-slate-700">Аккаунт</h2>
            <dl className="mt-2 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Логин</dt>
                <dd className="truncate font-medium text-[color:var(--ink)]">{account.username}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Данные</dt>
                <dd className="font-medium text-[color:var(--ink)]">
                  {mode === 'server' ? 'с сервера' : 'локальные'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Доступ</dt>
                <dd className="font-medium text-[color:var(--ink)]">
                  {mode === 'server' ? 'сессия' : 'без аккаунта'}
                </dd>
              </div>
            </dl>

            {mode === 'server' ? (
              <button
                type="button"
                onClick={logout}
                className="mt-3 min-h-[40px] w-full rounded-xl border border-slate-200 text-xs font-medium text-[color:var(--danger)] transition-colors hover:border-[color:var(--danger)] hover:bg-red-50"
              >
                Выйти из аккаунта
              </button>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[10px] leading-snug text-slate-500">
                Локальный демо-режим: аккаунта нет. Выйти можно после входа через сервер.
              </p>
            )}
          </section>
        </aside>
      </div>

      {justSaved && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-[calc(82px+env(safe-area-inset-bottom))] z-20 lg:bottom-6 lg:left-auto lg:right-8 lg:w-auto"
        >
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800 shadow-sm">
            <CheckCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            Профиль сохранён
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
