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
      <ul className="mx-auto flex max-w-[480px] justify-around">
        {navigationItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'text-[color:var(--brand)]' : 'text-slate-500 hover:text-slate-800',
                ].join(' ')
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" aria-hidden="true" strokeWidth={isActive ? 2.2 : 1.6} />
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
