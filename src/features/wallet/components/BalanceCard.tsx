import React from 'react';

interface BalanceCardProps {
  balance: number;
  entriesCount: number;
}

const LEVELS = [
  { min: 0, name: 'Новичок', next: 200 },
  { min: 200, name: 'Студент', next: 500 },
  { min: 500, name: 'Профи', next: 1000 },
  { min: 1000, name: 'Эксперт', next: 1000 },
];

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, entriesCount }) => {
  const level = [...LEVELS].reverse().find((item) => balance >= item.min) ?? LEVELS[0]!;
  const progress = level.next > level.min ? Math.min(100, ((balance - level.min) / (level.next - level.min)) * 100) : 100;

  return (
    <section
      className="rounded-2xl p-4 text-white"
      style={{ background: 'linear-gradient(135deg, #123a63 0%, #1c5488 100%)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs opacity-80">Баланс FinCoin</p>
          <p className="tnum mt-1 text-3xl font-bold">
            {balance} <span className="text-base font-medium">FC</span>
          </p>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[10px] font-semibold"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          {level.name}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] opacity-80">
          <span>До уровня «{LEVELS[LEVELS.indexOf(level) + 1]?.name ?? 'Эксперт'}»</span>
          <span className="tnum">{Math.max(0, level.next - balance)} FC</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-white/25">
          <div
            className="h-1.5 rounded-full bg-[color:var(--gold)]"
            style={{ width: `${progress}%`, transition: 'width 300ms var(--ease)' }}
          />
        </div>
      </div>

      <p className="mt-3 text-[11px] opacity-80">
        {entriesCount} записей в реестре · начисления только за вклад, не за активность
      </p>
    </section>
  );
};

export default BalanceCard;
