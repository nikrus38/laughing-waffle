import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  UserIcon,
  HeartIcon,
  WalletIcon,
  ShieldCheckIcon,
  PlusIcon,
  ChartBarIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  MapIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';

interface TabConfig {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
  soft: string;
  end: boolean;
}

const PRIMARY_TABS: TabConfig[] = [
  { to: '/', label: 'Обзор', icon: Squares2X2Icon, accent: '#233e76', soft: '#e6ebf5', end: true },
  { to: '/twin', label: 'Двойник', icon: UserIcon, accent: '#275e9f', soft: '#e7eef8', end: false },
  { to: '/matcher', label: 'Матч', icon: HeartIcon, accent: '#0198af', soft: '#e2f3f6', end: false },
  { to: '/wallet', label: 'Кошелёк', icon: WalletIcon, accent: '#b07d0a', soft: '#fdf3dc', end: false },
  { to: '/ethics', label: 'Этика', icon: ShieldCheckIcon, accent: '#256569', soft: '#e4f0f0', end: false },
];

const EXTRA_TABS = [
  { to: '/diagnostics', label: 'Диагностика', icon: ChartBarIcon },
  { to: '/trajectory', label: 'Траектория', icon: MapIcon },
  { to: '/patents', label: 'Радар патентов', icon: BeakerIcon },
  { to: '/decomposer', label: 'Декомпозиция', icon: PuzzlePieceIcon },
  { to: '/demo', label: 'Сценарии и защита', icon: PlayCircleIcon },
];

const PAGE_TITLES: Record<string, { title: string; hint: string }> = {
  '/': { title: 'Обзор', hint: 'сводка траектории и FinCoin' },
  '/twin': { title: 'Цифровой двойник', hint: 'компетенции и зона роста' },
  '/matcher': { title: 'ИИ-сват', hint: 'задачи партнёров и объяснение матча' },
  '/wallet': { title: 'Кошелёк FinCoin', hint: 'реестр начислений' },
  '/ethics': { title: 'Этика ИИ', hint: 'ценности как правила алгоритма' },
  '/diagnostics': { title: 'Диагностика', hint: 'барьеры, потоки данных, прогноз' },
  '/trajectory': { title: 'Траектория', hint: 'сценарии А, Б, В' },
  '/patents': { title: 'Радар патентов', hint: 'предиктивная наука' },
  '/decomposer': { title: 'Декомпозиция', hint: 'запрос партнёра → учебные кейсы' },
  '/demo': { title: 'Сценарии и защита', hint: 'демо и таймер' },
};

const TopBar: React.FC = () => {
  const user = useStore((s) => s.user);
  const balance = useStore((s) => s.finCoinBalance);
  const userRole = useStore((s) => s.userRole);
  const setUserRole = useStore((s) => s.setUserRole);
  const location = useLocation();

  const [plusOpen, setPlusOpen] = useState(false);
  const plusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plusOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!plusRef.current?.contains(event.target as Node)) setPlusOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPlusOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [plusOpen]);

  useEffect(() => setPlusOpen(false), [location.pathname]);

  const initials = user.displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

  const firstName = user.displayName.split(' ')[0] ?? user.displayName;
  const page = PAGE_TITLES[location.pathname] ?? { title: 'Консоль', hint: 'ФинТвин' };
  const activeTab = PRIMARY_TABS.find((tab) => tab.to === location.pathname);

  return (
    <>
      {/* Мобильная шапка: компактная, как в Telegram Mini App */}
      <header className="sticky top-0 z-20 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, #233e76 0%, #0198af 100%)' }}
          aria-hidden="true"
        />
        <div className="border-b border-slate-200/70 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="На главную">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: 'var(--brand)' }}
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[color:var(--ink)]">
                  {firstName}
                </span>
                <span className="block truncate text-[10px] text-[color:var(--ink-muted)]">
                  {user.course} курс · Финансовый университет
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                to="/wallet"
                className="tnum flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold"
                style={{ background: 'var(--gold-soft)', color: '#8a6209' }}
                aria-label={`Баланс ${balance} FinCoin`}
              >
                <span aria-hidden="true">🪙</span>
                {balance}
                <span className="text-[10px] font-medium">FC</span>
              </Link>

              <button
                type="button"
                onClick={() => setUserRole(userRole === 'student' ? 'partner' : 'student')}
                className="min-h-[36px] rounded-full border border-slate-300 px-2.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                aria-pressed={userRole === 'partner'}
                aria-label="Переключить роль: студент или партнёр"
              >
                {userRole === 'student' ? 'Студент' : 'Партнёр'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Десктоп: полоса вкладок как в браузере + панель страницы */}
      <header className="console-dark sticky top-0 z-20 hidden lg:block">
        <div
          className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, #233e76 0%, #0198af 100%)' }}
          aria-hidden="true"
        />
        <div className="flex items-end gap-1 border-b border-slate-200 bg-[#e9edf3] px-3 pt-2">
          <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
            {PRIMARY_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    [
                      'group relative flex h-9 max-w-[168px] min-w-0 items-center gap-2 rounded-t-[10px] border border-b-0 px-3 text-xs transition-colors',
                      isActive
                        ? 'border-slate-200 bg-white font-semibold text-[color:var(--ink)]'
                        : 'border-transparent bg-slate-200/60 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
                    ].join(' ')
                  }
                  style={({ isActive }) => (isActive ? { boxShadow: '0 1px 0 #fff' } : undefined)}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] transition-colors"
                        style={
                          isActive
                            ? { background: tab.soft, color: tab.accent }
                            : { background: 'rgba(255,255,255,0.8)', color: '#94a3b8' }
                        }
                        aria-hidden="true"
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="truncate">{tab.label}</span>
                      {isActive && (
                        <span
                          className="absolute left-3 right-3 top-0 h-[2px] rounded-b"
                          style={{ background: tab.accent }}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="relative shrink-0 self-center pb-1.5" ref={plusRef}>
            <button
              type="button"
              onClick={() => setPlusOpen((value) => !value)}
              aria-expanded={plusOpen}
              aria-haspopup="menu"
              aria-label="Все разделы"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-[color:var(--ink)]"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            {plusOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
              >
                <p className="px-2 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Ещё разделы
                </p>
                {EXTRA_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100"
                    >
                      <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex h-12 items-center gap-3 border-b border-slate-200 bg-white px-6">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: activeTab?.accent ?? 'var(--brand)' }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-[color:var(--ink)]">{page.title}</span>
          <span className="hidden text-[11px] text-slate-400 xl:inline">{page.hint}</span>

          <div className="ml-auto flex items-center gap-2">
            <span
              className="hidden rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 2xl:inline-flex"
              title="Все содержимое демонстрационное"
            >
              демо-данные
            </span>

            <button
              type="button"
              onClick={() => setUserRole(userRole === 'student' ? 'partner' : 'student')}
              aria-pressed={userRole === 'partner'}
              className="min-h-[30px] rounded-full border border-slate-300 px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {userRole === 'student' ? 'Студент' : 'Партнёр'}
            </button>

            <Link
              to="/wallet"
              className="tnum flex min-h-[30px] items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold"
              style={{ background: 'var(--gold-soft)', color: '#8a6209' }}
            >
              <span aria-hidden="true">🪙</span>
              {balance}
              <span className="text-[9px] font-medium opacity-80">FC</span>
            </Link>

            <Link
              to="/"
              className="hidden min-h-[30px] items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-500 transition-colors hover:text-[color:var(--ink)] xl:flex"
              title="Открыть публичный сайт"
            >
              На сайт
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            <Link
              to="/twin"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
              aria-label="Профиль цифрового двойника"
            >
              {initials}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopBar;
