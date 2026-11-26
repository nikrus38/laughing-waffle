import React, { useState } from 'react';

interface SkillForecast {
  name: string;
  current: number;
  // MOCK: демонстрационные значения, иллюстрация метода
  byYear: [number, number, number, number, number];
}

const SKILLS: SkillForecast[] = [
  { name: 'Анализ данных', current: 65, byYear: [70, 75, 80, 85, 90] },
  { name: 'Искусственный интеллект', current: 45, byYear: [50, 55, 62, 68, 74] },
  { name: 'Финансовые технологии', current: 55, byYear: [60, 65, 70, 75, 80] },
  { name: 'Кибербезопасность', current: 40, byYear: [46, 52, 58, 63, 68] },
  { name: 'Объяснимый ИИ', current: 25, byYear: [32, 40, 49, 58, 66] },
];

const ForecastChart: React.FC = () => {
  const [horizon, setHorizon] = useState(3);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-[color:var(--ink)]">Прогноз спроса на навыки</h2>
      <p className="mt-1 text-[11px] text-slate-500">
        Иллюстрация метода. Значения демонстрационные, это не результат исследования рынка.
      </p>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>1 год</span>
          <span>5 лет</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={horizon}
          onChange={(event) => setHorizon(Number(event.target.value))}
          aria-label="Горизонт прогноза в годах"
          className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[color:var(--brand)]"
        />
        <p className="tnum mt-1 text-center text-sm font-semibold text-[color:var(--brand)]">
          Горизонт: {horizon} {horizon === 1 ? 'год' : horizon < 5 ? 'года' : 'лет'}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {SKILLS.map((skill) => {
          const value = skill.byYear[horizon - 1]!;
          const delta = value - skill.current;
          return (
            <li key={skill.name}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-[color:var(--ink)]">{skill.name}</span>
                <span className="tnum text-[11px] text-slate-500">
                  {skill.current}% → <span className="font-semibold text-[color:var(--ink)]">{value}%</span>{' '}
                  <span style={{ color: delta >= 15 ? '#0b6b62' : '#8a6209' }}>
                    (+{delta})
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${value}%`,
                    background: 'linear-gradient(90deg, var(--brand) 0%, var(--mint) 100%)',
                    transition: 'width 200ms var(--ease)',
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <h3 className="text-xs font-semibold text-[color:var(--ink)]">
          Как считали бы по-настоящему
        </h3>
        <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
          <li>• Временные ряды вакансий и требуемых навыков.</li>
          <li>• Патентные кластеры и их динамика.</li>
          <li>• Отчёты индустриальных партнёров.</li>
          <li>• Макроэкономические тренды и данные о выпускниках.</li>
        </ul>
      </div>
    </section>
  );
};

export default ForecastChart;
