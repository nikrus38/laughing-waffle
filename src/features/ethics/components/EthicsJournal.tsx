import React from 'react';
import { useStore } from '../../../shared/store/useStore';
import { getValueName } from '../../../data/values';

const MODULE_NAMES: Record<string, string> = {
  matcher: 'ИИ-сват',
  twin: 'Двойник',
  wallet: 'Кошелёк',
  decomposer: 'Декомпозиция',
  patents: 'Радар патентов',
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} дн. назад`;
  if (hours > 0) return `${hours} ч назад`;
  if (minutes > 0) return `${minutes} мин назад`;
  return 'Только что';
}

const EthicsJournal: React.FC = () => {
  const ethicsLog = useStore((s) => s.ethicsLog);

  if (ethicsLog.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Журнал пока пуст.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
        Каждое решение алгоритма оставляет запись: что рассматривали, что отклонили и какая
        ценность сработала.
      </p>

      {ethicsLog.map((decision) => {
        const chosenLabel =
          decision.considered.find((item) => item.id === decision.chosen)?.label ??
          decision.chosen;

        return (
          <article key={decision.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[color:var(--ink)]">
                  {decision.summary}
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {MODULE_NAMES[decision.module] ?? decision.module} · правило {decision.ruleId}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-slate-400">
                {formatTime(decision.ts)}
              </span>
            </div>

            {decision.rejected.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Отклонено
                </p>
                <ul className="mt-1 space-y-1">
                  {decision.rejected.map((item) => (
                    <li key={item.id} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <span aria-hidden="true" style={{ color: 'var(--danger)' }}>
                        ✕
                      </span>
                      <span>
                        {item.reason}
                        <span
                          className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
                          style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
                        >
                          {getValueName(item.valueId)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-2 text-xs text-[color:var(--ink)]">
              <span className="font-medium" style={{ color: '#0b6b62' }}>
                Выбрано:{' '}
              </span>
              {chosenLabel}
            </p>

            <div className="mt-2 flex flex-wrap gap-1">
              {decision.valueIds.map((valueId) => (
                <span
                  key={valueId}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
                >
                  🛡 {getValueName(valueId)}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default EthicsJournal;
