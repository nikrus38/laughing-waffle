import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '🏛',
    title: 'Что это',
    text: 'ФинТвин — демо-модель Университета 4.0: ИИ, данные и цифровой двойник работают на развитие человека, а ценности — этический фильтр алгоритмов.',
  },
  {
    icon: '🎮',
    title: 'Как играть',
    text: 'Откликайтесь на задачи партнёров, проходите микромодули, получайте FinCoin за вклад. Свайп или кнопки — на ваш выбор.',
  },
  {
    icon: '🔄',
    title: 'Сбросить демо',
    text: 'Экран «Сценарии» (кнопка на главной или адрес #/demo) возвращает всё в исходное состояние. Все данные — демонстрационные.',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="text-5xl" aria-hidden="true">
        {current.icon}
      </span>
      <h1 className="mt-4 text-xl font-bold text-[color:var(--ink)]">{current.title}</h1>
      <p className="mt-2 max-w-[320px] text-sm leading-relaxed text-[color:var(--ink-muted)]">
        {current.text}
      </p>

      <div className="mt-5 flex gap-2" aria-hidden="true">
        {STEPS.map((item, index) => (
          <span
            key={item.title}
            className="h-2 w-2 rounded-full transition-colors"
            style={{ background: index === step ? 'var(--brand)' : '#cbd5e1' }}
          />
        ))}
      </div>

      <div className="mt-6 w-full max-w-[320px] space-y-2">
        <button
          type="button"
          onClick={() => (isLast ? onComplete() : setStep(step + 1))}
          className="min-h-[48px] w-full rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          {isLast ? 'Начать' : 'Далее'}
        </button>

        {!isLast && (
          <button
            type="button"
            onClick={onComplete}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-600"
          >
            Пропустить
          </button>
        )}
      </div>

      <p className="mt-6 text-[11px] text-slate-400">
        ФинТвин · Университет 4.0 · демо-данные
      </p>
    </div>
  );
};

export default Onboarding;
