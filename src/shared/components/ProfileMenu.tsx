import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  PlayCircleIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { api } from '../api/client';
import { useStore } from '../store/useStore';
import { initialsOf } from '../../domain/profile';

interface ProfileMenuProps {
  /** К какой стороне триггера прижимается плашка. */
  align?: 'left' | 'right';
  /** Вверх — для блока внизу сайдбара, вниз — для шапки. */
  placement?: 'up' | 'down';
  /** Подпись кнопки для скринридера. */
  label: string;
  triggerClassName?: string;
  children: React.ReactNode;
}

/**
 * Плашка профиля: открывается по клику на аватар.
 * Внутри — переход в настройки и выход из аккаунта.
 * В локальном демо-режиме аккаунта нет, и это честно написано.
 */
const ProfileMenu: React.FC<ProfileMenuProps> = ({
  align = 'right',
  placement = 'down',
  label,
  triggerClassName,
  children,
}) => {
  const user = useStore((s) => s.user);
  const account = useStore((s) => s.account);
  const userRole = useStore((s) => s.userRole);
  const mode = useStore((s) => s.mode);
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => setOpen(false), [location.pathname]);

  const logout = async () => {
    setLeaving(true);
    try {
      if (mode === 'server') await api.post('/logout/');
    } catch {
      /* даже если сервер промолчал, уводим на публичную страницу */
    }
    window.location.assign('/');
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={triggerClassName}
      >
        {children}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Профиль"
          className={[
            'absolute z-40 w-[272px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_44px_-16px_rgba(11,31,58,0.4)]',
            'menu-pop',
            placement === 'up' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
            align === 'left' ? 'left-0' : 'right-0',
          ].join(' ')}
        >
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #233e76, #0198af)' }}
              aria-hidden="true"
            >
              {initialsOf(user.displayName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-[color:var(--ink)]">
                {user.displayName}
              </span>
              <span className="block truncate text-[10px] text-slate-500">
                {user.course} курс · {userRole === 'student' ? 'студент' : 'партнёр'}
              </span>
            </span>
          </div>

          <div className="my-1 border-t border-slate-100" />

          <Link
            to="/profile"
            role="menuitem"
            className="flex min-h-[38px] items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <UserCircleIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            Профиль и настройки
          </Link>

          <Link
            to="/twin"
            role="menuitem"
            className="flex min-h-[38px] items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <SparklesIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            Цифровой двойник
          </Link>

          <Link
            to="/demo"
            role="menuitem"
            className="flex min-h-[38px] items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <PlayCircleIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            Сценарии защиты
          </Link>

          <div className="my-1 border-t border-slate-100" />

          <a
            href={userRole === 'student' ? '/demo-login/partner/' : '/demo-login/'}
            role="menuitem"
            className="flex min-h-[38px] items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-[color:var(--ink)] transition-colors hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <ArrowsRightLeftIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            {userRole === 'student' ? 'Профиль партнёра' : 'Профиль студента'}
          </a>

          {mode === 'server' ? (
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={leaving}
              className="flex min-h-[38px] w-full items-center gap-2.5 rounded-lg px-2 text-xs font-medium text-[color:var(--danger)] transition-colors hover:bg-red-50 focus-visible:bg-red-50 disabled:opacity-60"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {leaving ? 'Выходим…' : 'Выйти из аккаунта'}
            </button>
          ) : (
            <p className="px-2 py-2 text-[10px] leading-snug text-slate-500">
              Локальный демо-режим: аккаунта нет, поэтому выходить некуда. Войдите через сервер,
              чтобы управлять сессией.
            </p>
          )}

          <p className="truncate px-2 pb-1 pt-1 text-[10px] text-slate-400">
            {mode === 'server' ? `логин ${account.username}` : 'демо-данные'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
