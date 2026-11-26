import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../shared/store/useStore';

interface Scenario {
  id: string;
  title: string;
  minutes: string;
  steps: string[];
  startRoute: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'first-month',
    title: 'Первый месяц первокурсника',
    minutes: '2–3 мин',
    steps: [
      'Открыть «Матч» и откликнуться на задачу',
      'Посмотреть план первого месяца',
      'Пройти микромодуль в «Двойнике»',
      'Получить +20 FinCoin за данные для ИИ',
    ],
    startRoute: '/matcher',
  },
  {
    id: 'industry',
    title: 'Запрос индустрии',
    minutes: '2–3 мин',
    steps: [
      'Переключить роль на «Партнёр»',
      'Открыть «Декомпозицию» и разложить задачу',
      'Показать кейсы по курсам и сумму FinCoin',
      'Вернуться в «Кошелёк» и проверить цепочку',
    ],
    startRoute: '/decomposer',
  },
  {
    id: 'temptation',
    title: 'Соблазн лёгких баллов',
    minutes: '1–2 мин',
    steps: [
      'Открыть «Этику ИИ»',
      'Двинуть ползунок искушения до максимума',
      'Показать, что алгоритм всё равно ведёт по пути развития',
      'Открыть журнал решений и правило WALLET-001',
    ],
    startRoute: '/ethics',
  },
];

const Demo: React.FC = () => {
  const navigate = useNavigate();
  const resetDemo = useStore((s) => s.resetDemo);

  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(intervalRef.current ?? undefined);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Сценарии и защита</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Три сценария на 2–3 минуты и таймер защиты на 7–10 минут.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Таймер защиты</h2>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="tnum text-3xl font-bold" aria-live="polite">
            {minutes}:{seconds}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              className="min-h-[44px] rounded-xl px-4 text-sm font-semibold text-white"
              style={{ background: running ? 'var(--danger)' : 'var(--brand)' }}
            >
              {running ? 'Пауза' : 'Старт'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(10 * 60);
              }}
              className="min-h-[44px] rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700"
            >
              Сброс
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 space-y-3">
        {SCENARIOS.map((scenario, index) => (
          <section key={scenario.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm font-semibold text-[color:var(--ink)]">
                {index + 1}. {scenario.title}
              </h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {scenario.minutes}
              </span>
            </div>
            <ol className="mt-2 space-y-1 text-xs text-slate-600">
              {scenario.steps.map((step, stepIndex) => (
                <li key={step}>
                  {stepIndex + 1}) {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => navigate(scenario.startRoute)}
              className="mt-3 min-h-[44px] w-full rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--mint)' }}
            >
              Запустить сценарий
            </button>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Сброс демо</h2>
        <p className="mt-1 text-xs text-slate-600">
          Вернёт баланс, историю, двойника и пройденные модули в исходное состояние.
        </p>
        <button
          type="button"
          onClick={() => {
            void resetDemo().then(() => navigate('/'));
          }}
          className="mt-3 min-h-[44px] w-full rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700"
        >
          Сбросить демо
        </button>
      </section>

      <p className="mt-4 text-center text-[11px] text-slate-400">
        Быстрый вход: добавьте <span className="font-mono">/app/demo</span> к адресу приложения.
      </p>
    </div>
  );
};

export default Demo;
