import React from 'react';
import { useStore } from '../../shared/store/useStore';
import BalanceCard from './components/BalanceCard';
import TransactionList from './components/TransactionList';
import AwardButton from './components/AwardButton';
import ChainVerification from './components/ChainVerification';

const Wallet: React.FC = () => {
  const balance = useStore((s) => s.finCoinBalance);
  const ledger = useStore((s) => s.ledger);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Кошелёк FinCoin</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Начисления за вклад в общее дело, а не за активность.
        </p>
      </header>

      <BalanceCard balance={balance} entriesCount={ledger.length} />

      <div className="my-4">
        <AwardButton />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">История начислений</h2>
        <TransactionList entries={ledger} />
      </section>

      <div className="mt-4">
        <ChainVerification />
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Правила начисления</h2>
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          <li>• Одно основание нельзя засчитать дважды — дубли отклоняются.</li>
          <li>• Дневные лимиты по типам: данные для ИИ — 3, Data Challenge — 1, наставничество — 2.</li>
          <li>• Лайки за наставничество считаются только от уникальных пользователей (демо-имитация).</li>
          <li>• Каждая запись хранит хэш предыдущей, цепочку можно проверить.</li>
        </ul>
      </section>
    </div>
  );
};

export default Wallet;
