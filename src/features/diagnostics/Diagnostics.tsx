import React, { useState } from 'react';
import BarrierHeatmap from './components/BarrierHeatmap';
import DataFlowDiagram from './components/DataFlowDiagram';
import ForecastChart from './components/ForecastChart';

type Tab = 'heatmap' | 'flow' | 'forecast';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'heatmap', label: 'Барьеры' },
  { id: 'flow', label: 'Потоки' },
  { id: 'forecast', label: 'Прогноз' },
];

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('heatmap');

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Диагностика</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Где ломается связка вуза и индустрии и что с этим делает Университет 4.0.
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

      {activeTab === 'heatmap' && <BarrierHeatmap />}
      {activeTab === 'flow' && <DataFlowDiagram />}
      {activeTab === 'forecast' && <ForecastChart />}
    </div>
  );
};

export default Diagnostics;
