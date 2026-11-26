import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  MapIcon,
  PuzzlePieceIcon,
  BeakerIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

const modules = [
  {
    to: '/diagnostics',
    title: 'Диагностика',
    description: 'Барьеры кооперации, потоки данных, прогноз',
    icon: ChartBarIcon,
  },
  {
    to: '/trajectory',
    title: 'Траектория',
    description: 'Сценарии А, Б, В и выбор команды',
    icon: MapIcon,
  },
  {
    to: '/decomposer',
    title: 'Декомпозиция',
    description: 'Задача партнёра → учебные кейсы',
    icon: PuzzlePieceIcon,
  },
  {
    to: '/patents',
    title: 'Радар патентов',
    description: 'Предиктивная наука и темы для кафедр',
    icon: BeakerIcon,
  },
  {
    to: '/demo',
    title: 'Сценарии',
    description: 'Режим защиты и сброс демо',
    icon: PlayCircleIcon,
  },
];

const ModuleGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {modules.map(({ to, title, description, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex min-h-[104px] flex-col rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-[color:var(--brand)]"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
          >
            <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} aria-hidden="true" />
          </span>
          <span className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{title}</span>
          <span className="mt-0.5 text-[11px] leading-snug text-[color:var(--ink-muted)]">
            {description}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default ModuleGrid;
