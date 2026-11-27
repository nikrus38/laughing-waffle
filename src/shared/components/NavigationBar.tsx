import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserIcon,
  HeartIcon,
  WalletIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigationItems = [
  { to: '/', label: 'Главная', icon: HomeIcon, end: true },
  { to: '/twin', label: 'Двойник', icon: UserIcon, end: false },
  { to: '/matcher', label: 'Матч', icon: HeartIcon, end: false },
  { to: '/wallet', label: 'Кошелёк', icon: WalletIcon, end: false },
  { to: '/ethics', label: 'Этика', icon: ShieldCheckIcon, end: false },
];

const NavigationBar: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur"
      aria-label="Основная навигация"
    >
      <ul className="mx-auto flex max-w-[480px] justify-around px-1">
        {navigationItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 px-1 pb-1.5 pt-2 text-[10px] transition-colors',
                  isActive ? 'font-semibold text-[color:var(--brand)]' : 'font-medium text-slate-500',
                ].join(' ')
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="absolute top-0 h-[2px] w-7 rounded-b-full transition-opacity"
                    style={{
                      background: 'var(--brand)',
                      opacity: isActive ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className={[
                      'flex h-7 w-11 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-[color:var(--brand-soft)]' : '',
                    ].join(' ')}
                  >
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                      strokeWidth={isActive ? 2.2 : 1.6}
                    />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default NavigationBar;
