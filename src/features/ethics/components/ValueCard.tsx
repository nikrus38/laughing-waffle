import React, { useState } from 'react';
import { Value, ValueRule } from '../../../data/values';

interface ValueCardProps {
  value: Value;
  rule?: ValueRule | null;
}

const ValueCard: React.FC<ValueCardProps> = ({ value, rule = null }) => {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">{value.name}</h2>
        {rule && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
            style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
          >
            {rule.id}
          </span>
        )}
      </div>

      <p
        className={[
          'mt-2 rounded-xl p-2.5 text-xs',
          value.text ? 'bg-slate-50 text-slate-700' : 'bg-slate-50 italic text-slate-500',
        ].join(' ')}
      >
        {value.text ?? 'Официальный текст уточняется'}
      </p>

      {rule ? (
        <>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Как это зашито в алгоритм
          </p>
          <p className="mt-1 text-xs text-[color:var(--ink)]">{rule.algorithm}</p>

          <div className="mt-3 grid gap-2">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Без этики
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{rule.without}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: 'var(--mint-soft)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#0b6b62' }}>
                С этикой
              </p>
              <p className="mt-0.5 text-xs text-[color:var(--ink)]">{rule.with}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Правило для этой ценности пока не описано. Добавим после получения официального перечня.
        </p>
      )}

      <button
        type="button"
        onClick={() => setWhyOpen(true)}
        className="mt-3 min-h-[44px] w-full rounded-xl border border-slate-300 text-xs font-semibold text-[color:var(--brand)]"
      >
        Почему так?
      </button>

      {whyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`why-${value.id}`}
        >
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 id={`why-${value.id}`} className="text-base font-bold text-[color:var(--ink)]">
              {value.name}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              {rule ? `Правило ${rule.id} · модуль «${rule.module}»` : 'Правило ещё не описано'}
            </p>
            <p className="mt-3 text-sm text-[color:var(--ink)]">
              {rule?.algorithm ??
                'Алгоритм пока не опирается на эту ценность — правило появится после согласования официального перечня.'}
            </p>
            {rule && (
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                Пример: {rule.with}
              </p>
            )}
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

export default ValueCard;
