import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../shared/store/useStore';
import { calculateMatch } from '../../domain/matching';
import { ensureStretchInTop3 } from '../../domain/ethics';
import { EthicsDecision, MatchResult, PartnerTask } from '../../domain/types';
import SwipeableTaskCard from './components/SwipeableTaskCard';
import TaskDetail from './components/TaskDetail';
import TaskPlan from './components/TaskPlan';

interface RankedTask {
  task: PartnerTask;
  match: MatchResult;
}

const Matcher: React.FC = () => {
  const user = useStore((s) => s.user);
  const tasks = useStore((s) => s.availableTasks);
  const skippedTaskIds = useStore((s) => s.skippedTaskIds);
  const applyToTask = useStore((s) => s.applyToTask);
  const skipTask = useStore((s) => s.skipTask);
  const logEthicsDecision = useStore((s) => s.logEthicsDecision);

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [planTaskId, setPlanTaskId] = useState<string | null>(null);
  const [harder, setHarder] = useState(false);
  const loggedDecisionRef = useRef<string | null>(null);

  const { ranked, decision } = useMemo<{
    ranked: RankedTask[];
    decision: EthicsDecision | null;
  }>(() => {
    const visible = tasks.filter((task) => !skippedTaskIds.includes(task.id));
    const withMatches = visible.map((task) => ({ task, match: calculateMatch(user, task) }));

    if (harder) {
      return {
        ranked: withMatches.sort(
          (a, b) => b.task.difficulty - a.task.difficulty || b.match.score - a.match.score,
        ),
        decision: null,
      };
    }

    // Правило MATCH-001: в первой тройке должна быть задача на вырост
    const { ordered, decision: ethicsDecision } = ensureStretchInTop3(
      withMatches.map(({ task, match }) => ({
        taskId: task.id,
        title: task.title,
        isStretch: match.isStretch,
        score: match.score,
      })),
    );

    return {
      ranked: ordered
        .map((item) => withMatches.find((candidate) => candidate.task.id === item.taskId))
        .filter((item): item is RankedTask => Boolean(item)),
      decision: ethicsDecision,
    };
  }, [tasks, skippedTaskIds, user, harder]);

  // Каждое срабатывание правила MATCH-001 попадает в журнал этики
  useEffect(() => {
    if (!decision) return;
    if (loggedDecisionRef.current === decision.id) return;
    loggedDecisionRef.current = decision.id;
    logEthicsDecision(decision);
  }, [decision, logEthicsDecision]);

  const detailTask = ranked.find((item) => item.task.id === detailTaskId);
  const planTask = ranked.find((item) => item.task.id === planTaskId) ?? null;

  const handleApply = (taskId: string) => {
    void applyToTask(taskId);
    setDetailTaskId(null);
    setPlanTaskId(taskId);
  };

  if (planTask) {
    return (
      <TaskPlan
        task={planTask.task}
        match={planTask.match}
        user={user}
        onBackToStack={() => setPlanTaskId(null)}
      />
    );
  }

  if (detailTask) {
    return (
      <TaskDetail
        task={detailTask.task}
        match={detailTask.match}
        onBack={() => setDetailTaskId(null)}
        onApply={() => handleApply(detailTask.task.id)}
      />
    );
  }

  const current = ranked[0];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">ИИ-сват</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Задачи партнёров, отсортированные по вашему профилю компетенций.
        </p>
      </header>

      {ranked.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-2xl" aria-hidden="true">
            🤝
          </p>
          <p className="mt-2 text-sm font-medium text-[color:var(--ink)]">Пока задач нет</p>
          <p className="mt-1 text-xs text-slate-500">
            Вы пропустили все карточки. Перезапустите демо в разделе «Сценарии».
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-[color:var(--brand-soft)] p-3 text-[11px] text-[color:var(--brand)]">
            Свайп вправо — откликнуться, влево — пропустить, вверх — «хочу сложнее». Кнопки ниже
            делают то же самое.
          </div>

          {current && (
            <section className="mt-4">
              <SwipeableTaskCard
                key={current.task.id}
                task={current.task}
                match={current.match}
                onOpen={() => setDetailTaskId(current.task.id)}
                onApply={() => handleApply(current.task.id)}
                onSkip={() => skipTask(current.task.id)}
                onHarder={() => setHarder(true)}
              />
            </section>
          )}

          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[color:var(--ink)]">
              Ещё задачи ({Math.max(0, ranked.length - 1)})
            </h2>
            {harder && (
              <button
                type="button"
                onClick={() => setHarder(false)}
                className="text-[11px] font-medium text-[color:var(--brand)]"
              >
                Сбросить «сложнее»
              </button>
            )}
          </div>

          <div className="mt-2 space-y-2">
            {ranked.slice(1).map(({ task, match }) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setDetailTaskId(task.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-[color:var(--ink)]">
                    {task.title}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {task.partnerLabel} · сложность {task.difficulty}/5
                  </span>
                </span>
                <span className="tnum shrink-0 text-xs font-semibold text-[color:var(--brand)]">
                  {match.score}%
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Matcher;
