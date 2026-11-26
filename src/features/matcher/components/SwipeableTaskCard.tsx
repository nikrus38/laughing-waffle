import React, { useRef, useState } from 'react';
import { PartnerTask, MatchResult } from '../../../domain/types';
import TaskCard from './TaskCard';

interface SwipeableTaskCardProps {
  task: PartnerTask;
  match: MatchResult;
  onOpen: () => void;
  onApply: () => void;
  onSkip: () => void;
  onHarder: () => void;
}

/**
 * Карточка с жестами: вправо — отклик, влево — пропустить, вверх — «хочу сложнее».
 * Те же действия продублированы кнопками — для доступности и браузерного режима.
 */
const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  match,
  onOpen,
  onApply,
  onSkip,
  onHarder,
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const threshold = 90;

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    startRef.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!startRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    setOffset({
      x: touch.clientX - startRef.current.x,
      y: touch.clientY - startRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    startRef.current = null;

    if (offset.x > threshold) {
      reset();
      onApply();
      return;
    }
    if (offset.x < -threshold) {
      reset();
      onSkip();
      return;
    }
    if (offset.y < -threshold) {
      reset();
      onHarder();
      return;
    }
    reset();
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  const tilt = Math.max(-12, Math.min(12, offset.x * 0.06));

  return (
    <div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) rotate(${tilt}deg)`,
          transition: startRef.current ? 'none' : 'transform 200ms var(--ease)',
        }}
      >
        <TaskCard task={task} match={match} onOpen={onOpen} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="tnum">Совпадение {match.score}%</span>
        <span className="text-right">Почему так? — факторы ниже</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
        >
          Пропустить
        </button>
        <button
          type="button"
          onClick={onHarder}
          className="min-h-[44px] rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
        >
          Сложнее
        </button>
        <button
          type="button"
          onClick={onApply}
          className="min-h-[44px] rounded-xl text-xs font-semibold text-white"
          style={{ background: 'var(--mint-strong)' }}
        >
          Откликнуться
        </button>
      </div>

      <details className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700">Почему так?</summary>
        <ul className="mt-2 space-y-1">
          {match.factors.map((factor) => (
            <li key={factor.label} className="flex justify-between gap-2">
              <span>
                {factor.label} <span className="text-slate-400">(вес {factor.weight})</span>
              </span>
              <span className="tnum">{Math.round(factor.value * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-slate-500">{match.explanation}</p>
      </details>
    </div>
  );
};

export default SwipeableTaskCard;
