import React, { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { verifyChain } from '../../../domain/ledger';

const ChainVerification: React.FC = () => {
  const ledger = useStore((s) => s.ledger);
  const [result, setResult] = useState<{ valid: boolean; brokenAt?: number } | null>(null);

  const lastHash = ledger.length > 0 ? ledger[ledger.length - 1]!.hash : '—';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Реестр начислений</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Каждая запись хранит хэш предыдущей — подмена ломает цепочку.
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}
        >
          неизменяемо
        </span>
      </div>

      <button
        type="button"
        onClick={() => setResult(verifyChain(ledger))}
        className="mt-3 min-h-[44px] w-full rounded-xl border border-[color:var(--brand)] text-sm font-semibold text-[color:var(--brand)]"
      >
        Проверить цепочку
      </button>

      {result && (
        <div
          role="status"
          className="mt-3 rounded-xl p-3 text-xs"
          style={
            result.valid
              ? { background: 'var(--mint-soft)', color: '#0b6b62' }
              : { background: '#fde8e6', color: 'var(--danger)' }
          }
        >
          {result.valid
            ? `Цепочка целостна: проверено ${ledger.length} записей.`
            : `Нарушение целостности в записи №${(result.brokenAt ?? 0) + 1}.`}
        </div>
      )}

      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">Хэш последней записи</p>
        <p className="mt-1 break-all font-mono text-[11px] text-slate-700">{lastHash}</p>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        В демо используется упрощённая хэш-функция. В реальной системе — SHA-256 через
        crypto.subtle.
      </p>
    </section>
  );
};

export default ChainVerification;
