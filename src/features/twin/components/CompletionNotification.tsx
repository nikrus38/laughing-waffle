import React from 'react';

interface CompletionNotificationProps {
  ok: boolean;
  amount?: number;
  reason?: string;
  onClose: () => void;
}

const CompletionNotification: React.FC<CompletionNotificationProps> = ({
  ok,
  amount,
  reason,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-xl">
        <p className="text-center text-3xl" aria-hidden="true">
          {ok ? '🎉' : '⚠️'}
        </p>
        <h2 id="completion-title" className="mt-2 text-center text-base font-bold text-[color:var(--ink)]">
          {ok ? 'Модуль засчитан' : 'Начисление не выполнено'}
        </h2>
        <p className="mt-2 text-center text-sm text-[color:var(--ink-muted)]">
          {ok
            ? 'Ваши ошибки помогли улучшить курс для следующего потока.'
            : reason ?? 'Попробуйте позже.'}
        </p>

        {ok && amount ? (
          <div
            className="mt-4 flex items-center justify-center gap-2 rounded-xl p-3"
            style={{ background: 'var(--gold-soft)', color: '#8a6209' }}
          >
            <span className="tnum text-lg font-bold">+{amount} FinCoin</span>
            <span className="text-xs">за данные для обучения ИИ</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-[44px] w-full rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default CompletionNotification;
