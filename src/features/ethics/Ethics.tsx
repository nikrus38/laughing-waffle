import React, { useState } from 'react';
import { mockValues, getRuleForValue } from '../../data/values';
import { useStore } from '../../shared/store/useStore';
import ValueCard from './components/ValueCard';
import TemptationSimulator from './components/TemptationSimulator';
import EthicsJournal from './components/EthicsJournal';

type Tab = 'values' | 'simulator' | 'journal';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'values', label: 'Ценности' },
  { id: 'simulator', label: 'Искушение' },
  { id: 'journal', label: 'Журнал' },
];

const Ethics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('values');
  const storedValues = useStore((state) => state.serverValues);
  const storedRules = useStore((state) => state.serverRules);

  const values = storedValues ?? mockValues;
  const ruleFor = (valueId: string) =>
    storedRules?.find((rule) => rule.valueId === valueId) ?? getRuleForValue(valueId) ?? null;

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Этика ИИ</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Ценности университета как проверяемые правила, а не лозунги на стене.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'min-h-[40px] rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-white text-[color:var(--brand)] shadow-sm' : 'text-slate-600',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'values' && (
        <>
          <p className="mb-3 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
            Официальные формулировки ценностей ещё не переданы командой — там, где текста нет,
            показано «текст уточняется». Правила и примеры ниже — наше проектное решение.
          </p>
          <div className="space-y-3">
            {values.map((value) => (
              <ValueCard key={value.id} value={value} rule={ruleFor(value.id)} />
            ))}
          </div>
        </>
      )}

      {activeTab === 'simulator' && <TemptationSimulator />}

      {activeTab === 'journal' && <EthicsJournal />}
    </div>
  );
};

export default Ethics;
