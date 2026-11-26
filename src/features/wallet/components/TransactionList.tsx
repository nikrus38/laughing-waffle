import React from 'react';
import { FinCoinAction, LedgerEntry } from '../../../domain/types';
import { ACTION_ICONS, ACTION_NAMES } from '../../../shared/lib/fincoin';

interface TransactionListProps {
  entries: LedgerEntry[];
}

const TransactionList: React.FC<TransactionListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        Пока нет начислений. Нажмите «Начислить (демо)».
      </p>
    );
  }

  const sorted = [...entries].sort((a, b) => b.ts - a.ts);

  return (
    <ul className="divide-y divide-slate-100">
      {sorted.map((entry) => (
        <li key={entry.id} className="flex gap-3 py-3">
          <span className="text-xl" aria-hidden="true">
            {ACTION_ICONS[entry.action as FinCoinAction]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-[color:var(--ink)]">
                {ACTION_NAMES[entry.action as FinCoinAction]}
              </span>
              <span className="tnum shrink-0 text-sm font-bold" style={{ color: '#0b6b62' }}>
                +{entry.amount} FC
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[color:var(--ink-muted)]">{entry.basis}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">
                {new Date(entry.ts).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                #{entry.hash.slice(0, 8)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;
