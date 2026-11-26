import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface TodayCardProps {
  title: string;
  description: string;
  valueTag: string;
  reason: string;
  to: string;
}

const TodayCard: React.FC<TodayCardProps> = ({ title, description, valueTag, reason, to }) => {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-[color:var(--ink)]">{title}</h3>
      <p className="mt-1 text-xs text-[color:var(--ink-muted)]">{description}</p>

      <span
        className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
      >
        🛡 {valueTag}
      </span>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          to={to}
          className="flex min-h-[36px] items-center text-xs font-semibold text-[color:var(--brand)]"
        >
          Перейти →
        </Link>
        <button
          type="button"
          onClick={() => setWhyOpen(true)}
          className="min-h-[36px] text-[11px] font-medium text-slate-500 underline decoration-dotted"
        >
          Почему так?
        </button>
      </div>

      {whyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`why-${to}`}
        >
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Журнал решений ИИ
            </p>
            <h3 id={`why-${to}`} className="mt-1 text-base font-bold text-[color:var(--ink)]">
              {title}
            </h3>
            <p className="mt-3 text-sm text-[color:var(--ink)]">{reason}</p>
            <p className="mt-2 text-xs text-slate-500">
              Ценность, которая повлияла на выбор: {valueTag}. Пол, возраст, происхождение и
              средний балл в расчёте не участвуют.
            </p>
            <button
              type="button"
              onClick={() => setWhyOpen(false)}
              className="mt-4 min-h-[44px] w-full rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--brand)' }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default TodayCard;
