import React, { useState } from 'react';
import { useStore } from '../../shared/store/useStore';
import { mockMicromodules } from '../../data/modules';
import CompetencyRadar from './components/CompetencyRadar';
import MicromoduleList from './components/MicromoduleList';
import CompletionNotification from './components/CompletionNotification';
import { haptic } from '../../app/TelegramBridge';

type ViewMode = 'competencies' | 'grades';

const Twin: React.FC = () => {
  const user = useStore((s) => s.user);
  const completeModule = useStore((s) => s.completeModule);
  const completedModules = useStore((s) => s.completedModules);

  const [viewMode, setViewMode] = useState<ViewMode>('competencies');
  const [notification, setNotification] = useState<
    { ok: boolean; amount?: number; reason?: string } | null
  >(null);

  const handleComplete = async (moduleId: string) => {
    const result = await completeModule(moduleId, 0.8);
    haptic(result.ok ? 'success' : 'warning');
    setNotification(result);
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Цифровой двойник</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          {user.displayName} · {user.course} курс · профиль компетенций, а не средний балл
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'competencies'}
          onClick={() => setViewMode('competencies')}
          className={[
            'min-h-[40px] rounded-lg text-sm font-medium transition-colors',
            viewMode === 'competencies' ? 'bg-white text-[color:var(--brand)] shadow-sm' : 'text-slate-600',
          ].join(' ')}
        >
          Компетенции
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'grades'}
          onClick={() => setViewMode('grades')}
          className={[
            'min-h-[40px] rounded-lg text-sm font-medium transition-colors',
            viewMode === 'grades' ? 'bg-white text-[color:var(--brand)] shadow-sm' : 'text-slate-600',
          ].join(' ')}
        >
          Оценки
        </button>
      </div>

      {viewMode === 'competencies' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Радар компетенций</h2>
          <CompetencyRadar user={user} />
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Оценки</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
            Двойник видит навыки, а не средний балл. Оценки не участвуют в подборе задач и
            рекомендаций — это осознанное решение (правило TWIN-001).
          </p>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Средний балл скрыт: сравнение студентов между собой в интерфейсе отсутствует.
          </div>
        </section>
      )}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">Микромодули</h2>
          <span className="text-[11px] text-slate-500">
            пройдено {completedModules.length} из {mockMicromodules.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
          Отсортированы по вкладу в зону ближайшего развития.
        </p>
        <div className="mt-3">
          <MicromoduleList completedModules={completedModules} onComplete={handleComplete} />
        </div>
      </section>

      {notification && (
        <CompletionNotification
          ok={notification.ok}
          amount={notification.amount}
          reason={notification.reason}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Twin;
