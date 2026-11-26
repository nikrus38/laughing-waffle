import React from 'react';

interface SeamlessIndexProps {
  value: number;
}

const SeamlessIndex: React.FC<SeamlessIndexProps> = ({ value }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Индекс бесшовности</h2>
          <p className="mt-0.5 text-[11px] text-[color:var(--ink-muted)]">
            Траектория В · Сингулярность кампуса
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          демо-оценка
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24" viewBox="0 0 100 100" role="img" aria-label={`Индекс бесшовности ${value} из 100`}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e6ebf3" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--mint)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 300ms var(--ease)' }}
            />
          </svg>
          <span className="tnum absolute inset-0 flex items-center justify-center text-lg font-bold">
            {value}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-[color:var(--ink-muted)]">
          Доля дневных активностей — учёба, проект, стажировка, досуг, — связанных одной сквозной
          задачей. Растёт, когда вы действуете в приложении.
        </p>
      </div>
    </section>
  );
};

export default SeamlessIndex;
