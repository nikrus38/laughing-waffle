import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Squares2X2Icon,
  UserIcon,
  HeartIcon,
  WalletIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  MapIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  PlayCircleIcon,
  ChevronUpDownIcon,
  CheckIcon,
  UserCircleIcon,
  BriefcaseIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import ProfileMenu from '../shared/components/ProfileMenu';
import { useStore } from '../shared/store/useStore';

const STUDENT_GROUPS = [
  {
    label: 'Workspace',
    hint: 'Рабочее пространство',
    items: [
      { to: '/', label: 'Обзор', icon: Squares2X2Icon, end: true },
      { to: '/twin', label: 'Цифровой двойник', icon: UserIcon, end: false },
      { to: '/matcher', label: 'ИИ-сват', icon: HeartIcon, end: false },
    ],
  },
  {
    label: 'Account',
    hint: 'Личный кабинет',
    items: [
      { to: '/profile', label: 'Профиль и настройки', icon: UserCircleIcon, end: false },
      { to: '/wallet', label: 'Кошелёк FinCoin', icon: WalletIcon, end: false },
      { to: '/ethics', label: 'Этика ИИ', icon: ShieldCheckIcon, end: false },
    ],
  },
  {
    label: 'Analytics',
    hint: 'Данные и аналитика',
    items: [
      { to: '/diagnostics', label: 'Диагностика', icon: ChartBarIcon, end: false },
      { to: '/trajectory', label: 'Траектория', icon: MapIcon, end: false },
      { to: '/patents', label: 'Радар патентов', icon: BeakerIcon, end: false },
      { to: '/decomposer', label: 'Декомпозиция', icon: PuzzlePieceIcon, end: false },
    ],
  },
  {
    label: 'Demo',
    hint: 'Защита проекта',
    items: [{ to: '/demo', label: 'Сценарии и защита', icon: PlayCircleIcon, end: false }],
  },
];

const PARTNER_GROUPS = [
  {
    label: 'Workspace',
    hint: 'Кабинет партнёра',
    items: [
      { to: '/', label: 'Обзор', icon: Squares2X2Icon, end: true },
      { to: '/partner/tasks', label: 'Мои задачи', icon: BriefcaseIcon, end: false },
      { to: '/partner/tasks/new', label: 'Новая задача', icon: PlusCircleIcon, end: false },
    ],
  },
  {
    label: 'Account',
    hint: 'Личный кабинет',
    items: [
      { to: '/profile', label: 'Профиль и настройки', icon: UserCircleIcon, end: false },
      { to: '/ethics', label: 'Этика ИИ', icon: ShieldCheckIcon, end: false },
    ],
  },
  {
    label: 'Analytics',
    hint: 'Данные и аналитика',
    items: [
      { to: '/decomposer', label: 'Декомпозиция', icon: PuzzlePieceIcon, end: false },
      { to: '/diagnostics', label: 'Диагностика', icon: ChartBarIcon, end: false },
      { to: '/trajectory', label: 'Траектория', icon: MapIcon, end: false },
      { to: '/patents', label: 'Радар патентов', icon: BeakerIcon, end: false },
    ],
  },
  {
    label: 'Demo',
    hint: 'Защита проекта',
    items: [{ to: '/demo', label: 'Сценарии и защита', icon: PlayCircleIcon, end: false }],
  },
];

const LEVELS = [
  { min: 0, name: 'Новичок', next: 200 },
  { min: 200, name: 'Студент', next: 500 },
  { min: 500, name: 'Профи', next: 1000 },
  { min: 1000, name: 'Эксперт', next: 1500 },
];

const Sidebar: React.FC = () => {
  const user = useStore((s) => s.user);
  const balance = useStore((s) => s.finCoinBalance);
  const mode = useStore((s) => s.mode);
  const userRole = useStore((s) => s.userRole);

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!switcherOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setSwitcherOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSwitcherOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [switcherOpen]);

  const groups = userRole === 'partner' ? PARTNER_GROUPS : STUDENT_GROUPS;

  const level = [...LEVELS].reverse().find((item) => balance >= item.min) ?? LEVELS[0]!;
  const next = LEVELS.find((item) => item.min > level.min);
  const progress = next
    ? Math.min(100, ((balance - level.min) / (next.min - level.min)) * 100)
    : 100;

  const initials = user.displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Логотип продукта */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <img
          src="/static/web/brand/icon-192.png"
          alt=""
          className="h-8 w-8 shrink-0 rounded-md object-contain ring-1 ring-slate-200"
        />
        <span className="min-w-0 leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-[color:var(--ink)]">
            ФинТвин
          </span>
          <span className="block text-[9px] uppercase tracking-[0.12em] text-slate-500">
            Финансовый университет
          </span>
        </span>
      </div>

      {/* Переключатель пространства — как Personal ⌄ в OpenRouter */}
      <div className="relative px-3" ref={switcherRef}>
        <button
          type="button"
          onClick={() => setSwitcherOpen((value) => !value)}
          aria-expanded={switcherOpen}
          aria-haspopup="menu"
          className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[color:var(--ink)]">
              {userRole === 'student' ? 'Личное пространство' : 'Пространство партнёра'}
            </span>
            <span className="block truncate text-[10px] text-slate-500">
              {user.displayName} · {user.course} курс
            </span>
          </span>
          <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        </button>

        {switcherOpen && (
          <div
            role="menu"
            className="absolute left-3 right-3 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <p className="px-2 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Демо-профили
            </p>
            {[
              {
                key: 'student' as const,
                label: 'Студент',
                hint: 'Александр Петров · 1 курс',
                href: '/demo-login/',
              },
              {
                key: 'partner' as const,
                label: 'Партнёр и кафедра',
                hint: 'Марина Соколова · Крупный банк (пример)',
                href: '/demo-login/partner/',
              },
            ].map((item) => (
              <a
                key={item.key}
                href={item.href}
                role="menuitem"
                onClick={() => setSwitcherOpen(false)}
                aria-current={userRole === item.key ? 'true' : undefined}
                className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-100"
              >
                <span className="mt-0.5 flex h-4 w-4 items-center justify-center">
                  {userRole === item.key && (
                    <CheckIcon className="h-4 w-4" style={{ color: 'var(--brand)' }} aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-xs font-medium text-[color:var(--ink)]">
                    {item.label}
                  </span>
                  <span className="block text-[10px] text-slate-500">{item.hint}</span>
                </span>
              </a>
            ))}
            <p className="px-2 pb-1 pt-1 text-[10px] leading-snug text-slate-400">
              Это разные аккаунты: переключение входит в выбранный профиль.
            </p>

            <div className="my-1 border-t border-slate-100" />
            <Link
              to="/twin"
              onClick={() => setSwitcherOpen(false)}
              className="block rounded-lg px-8 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100"
            >
              Профиль двойника
            </Link>
            <Link
              to="/demo"
              onClick={() => setSwitcherOpen(false)}
              className="block rounded-lg px-8 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100"
            >
              Сценарии и сброс демо
            </Link>

            <p className="px-2 pb-1 pt-2 text-[9px] text-slate-400">
              {mode === 'server' ? 'данные с сервера' : 'локальные демо-данные'}
            </p>
          </div>
        )}
      </div>

      {/* Группы разделов */}
      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" aria-label="Разделы консоли">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="flex items-center gap-2 px-2 pb-1.5" title={group.hint}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {group.label}
              </p>
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            </div>

            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      [
                        'group relative flex min-h-[36px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors',
                        isActive
                          ? 'bg-[color:var(--brand-soft)] font-semibold text-[color:var(--brand)]'
                          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-[color:var(--ink)]',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={[
                            'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity',
                            isActive ? 'opacity-100' : 'opacity-0',
                          ].join(' ')}
                          style={{ background: 'var(--brand)' }}
                          aria-hidden="true"
                        />
                        <span
                          className={[
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
                            isActive ? 'bg-white text-[color:var(--brand)] shadow-sm' : 'text-slate-500',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Сводка и профиль */}
      <div className="shrink-0 border-t border-slate-200 p-3">
        {userRole !== 'partner' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                FinCoin
              </span>
              <span className="text-[10px] text-slate-500">{level.name}</span>
            </div>
            <p className="tnum mt-1 text-lg font-bold text-[color:var(--ink)]">{balance} FC</p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'var(--mint)',
                  transition: 'width 200ms var(--ease)',
                }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {next
                ? `до уровня «${next.name}» — ${Math.max(0, next.min - balance)} FC`
                : 'максимальный уровень'}
            </p>
          </div>
        )}

        <ProfileMenu
          align="left"
          placement="up"
          label="Меню профиля"
          triggerClassName="mt-2 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-100"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[color:var(--ink)]">
              {user.displayName}
            </span>
            <span className="block text-[10px] text-slate-500">
              {user.course} курс · {mode === 'server' ? 'сервер' : 'демо-режим'}
            </span>
          </span>
          <ChevronUpDownIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        </ProfileMenu>
      </div>
    </aside>
  );
};

export default Sidebar;
