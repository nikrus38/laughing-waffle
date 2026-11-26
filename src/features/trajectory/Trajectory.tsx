import React, { useState } from 'react';

type TrajectoryId = 'A' | 'B' | 'V';

interface TrajectoryInfo {
  id: TrajectoryId;
  title: string;
  metric: string;
  aiRole: string;
  examples: string[];
  risks: string[];
  scores: Record<string, number>;
}

// MOCK: содержательные тезисы — черновик команды, на согласование
const TRAJECTORIES: TrajectoryInfo[] = [
  {
    id: 'A',
    title: 'Цифровой шторм',
    metric: 'Скорость внедрения технологий',
    aiRole: 'Автоматизация администрирования и массовых курсов',
    examples: [
      'Единый личный кабинет с электронным расписанием',
      'Автопроверка типовых заданий',
      'Онлайн-запись на консультации',
    ],
    risks: ['Технологии ради технологий', 'Слабая связь с индустрией'],
    scores: { speed: 5, industry: 2, student: 2, scale: 4, values: 2 },
  },
  {
    id: 'B',
    title: 'Нейросеть территорий',
    metric: 'Охват регионов и партнёров',
    aiRole: 'Аналитика региональных рынков труда',
    examples: [
      'Сетевые программы с региональными вузами',
      'Прогноз кадровой потребности региона',
      'Стажировки на распределённых площадках',
    ],
    risks: ['Размывание единого опыта студента', 'Сложная логистика'],
    scores: { speed: 3, industry: 4, student: 3, scale: 5, values: 3 },
  },
  {
    id: 'V',
    title: 'Сингулярность кампуса',
    metric: 'Индекс бесшовности опыта',
    aiRole: 'Связывает учёбу, проекты и стажировки в одну траекторию',
    examples: [
      'Единая лента дня: пара, проектная встреча и консультация наставника в одном расписании',
      'Сквозная задача партнёра на несколько семестров',
      'Виртуальный кампус с наставниками и цифровым двойником',
    ],
    risks: ['Высокие требования к качеству данных', 'Нужна зрелая культура обратной связи'],
    scores: { speed: 4, industry: 4, student: 5, scale: 4, values: 5 },
  },
];

const CRITERIA: Array<{ key: string; label: string }> = [
  { key: 'speed', label: 'Скорость запуска' },
  { key: 'industry', label: 'Зависимость от индустрии' },
  { key: 'student', label: 'Ценность для студента' },
  { key: 'scale', label: 'Масштабируемость' },
  { key: 'values', label: 'Связь с ценностями' },
];

const Trajectory: React.FC = () => {
  const [selected, setSelected] = useState<TrajectoryId>('V');
  const current = TRAJECTORIES.find((t) => t.id === selected)!;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Траектория</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Три сценария развития университета. Выбор команды — «Сингулярность кампуса».
        </p>
      </header>

      <div className="grid gap-3">
        {TRAJECTORIES.map((trajectory) => {
          const isActive = trajectory.id === selected;
          return (
            <button
              key={trajectory.id}
              type="button"
              onClick={() => setSelected(trajectory.id)}
              aria-pressed={isActive}
              className={[
                'min-h-[44px] rounded-2xl border p-4 text-left transition-colors',
                isActive
                  ? 'border-[color:var(--brand)] bg-white shadow-sm'
                  : 'border-slate-200 bg-white/60 hover:border-slate-300',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[color:var(--ink)]">
                  {trajectory.id}. {trajectory.title}
                </span>
                {trajectory.id === 'V' && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: 'var(--mint-soft)', color: '#0b6b62' }}
                  >
                    выбор команды
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                Главная метрика: {trajectory.metric}
              </p>
            </button>
          );
        })}
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-[color:var(--ink)]">
          {current.id}. {current.title}
        </h2>

        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Главная метрика</dt>
            <dd className="text-[color:var(--ink)]">{current.metric}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Роль ИИ</dt>
            <dd className="text-[color:var(--ink)]">{current.aiRole}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Примеры в Финуниверситете
            </dt>
            <dd>
              <ul className="mt-1 space-y-1 text-[color:var(--ink)]">
                {current.examples.map((example) => (
                  <li key={example} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">Черновик, на согласование с командой</p>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Риски</dt>
            <dd>
              <ul className="mt-1 space-y-1 text-[color:var(--ink)]">
                {current.risks.map((risk) => (
                  <li key={risk} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-[color:var(--ink)]">Сравнение по критериям</h2>
        <p className="mt-1 text-xs text-slate-500">Оценка команды по шкале 1–5, демо-данные.</p>
        <div className="mt-3 space-y-3">
          {CRITERIA.map((criterion) => (
            <div key={criterion.key}>
              <div className="flex items-baseline justify-between text-xs text-slate-600">
                <span>{criterion.label}</span>
                <span className="tnum">
                  А {TRAJECTORIES[0]!.scores[criterion.key]} · Б {TRAJECTORIES[1]!.scores[criterion.key]} · В{' '}
                  {TRAJECTORIES[2]!.scores[criterion.key]}
                </span>
              </div>
              <div className="mt-1 flex gap-1" aria-hidden="true">
                {TRAJECTORIES.map((trajectory) => (
                  <div key={trajectory.id} className="flex-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${(trajectory.scores[criterion.key]! / 5) * 100}%`,
                          background:
                            trajectory.id === 'V' ? 'var(--mint)' : trajectory.id === 'A' ? '#94a3b8' : '#cbd5e1',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mt-5 rounded-2xl p-4"
        style={{ background: 'var(--brand-soft)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--brand)' }}>
          Почему В
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm" style={{ color: '#173a5e' }}>
          <li>• Бесшовность опыта — измеримая метрика, а не лозунг.</li>
          <li>• Сквозная задача партнёра связывает курсы, практику и наставничество.</li>
          <li>• Цифровой двойник делает развитие студента видимым и управляемым.</li>
          <li>• Этический фильтр встроен в алгоритмы, а не добавлен «сбоку».</li>
        </ul>
      </section>
    </div>
  );
};

export default Trajectory;
