import React, { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { FinCoinAction } from '../../../domain/types';
import { COIN_AMOUNTS } from '../../../domain/ledger';
import { haptic } from '../../../app/TelegramBridge';

interface AwardOption {
  action: FinCoinAction;
  title: string;
  description: string;
}

const OPTIONS: AwardOption[] = [
  {
    action: 'ai_training_data',
    title: 'Данные для обучения ИИ',
    description: 'Ошибки на сложном микрокурсе помогли улучшить программу',
  },
  {
    action: 'data_challenge',
    title: 'Решение Data Challenge',
    description: 'Задача партнёра, засчитывается после проверки кода',
  },
  {
    action: 'mentoring',
    title: 'Проактивное наставничество',
    description: 'Обучающий модуль для первокурсников',
  },
  {
    action: 'anomaly_report',
    title: 'Обнаружение аномалии',
    description: 'Баг или уязвимость, отчёт в отдел безопасности',
  },
  {
    action: 'market_value',
    title: 'Создание рыночной ценности',
    description: 'Курсовая → MVP → первый платящий клиент',
  },
  {
    action: 'knowledge_export',
    title: 'Экспорт знаний',
    description: 'Открытый модуль по истории российской финансовой инженерии',
  },
];

const AwardButton: React.FC = () => {
  const award = useStore((s) => s.award);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<AwardOption | null>(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const confirmAward = () => {
    if (!pending) return;
    setValidating(true);

    // Имитация валидации: проверка кода / уникальности основания
    window.setTimeout(async () => {
      const basis = `${pending.title}: ${pending.description}`;
      const outcome = await award(pending.action, basis);
      haptic(outcome.ok ? 'success' : 'warning');

      setValidating(false);
      setPending(null);
      setOpen(false);
      setResult(
        outcome.ok
          ? { ok: true, text: `Начислено +${outcome.amount} FinCoin. Запись добавлена в реестр.` }
          : { ok: false, text: outcome.reason ?? 'Начисление отклонено.' },
      );
    }, 700);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setResult(null);
          setPending(null);
        }}
        aria-expanded={open}
        className="min-h-[48px] w-full rounded-xl text-sm font-semibold text-white"
        style={{ background: 'var(--mint)' }}
      >
        {open ? 'Скрыть действия' : 'Начислить (демо)'}
      </button>

      {open && !pending && (
        <div className="mt-3 space-y-2">
          {OPTIONS.map((option) => (
            <button
              key={option.action}
              type="button"
              onClick={() => setPending(option)}
              className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[color:var(--mint)]"
            >
              <span>
                <span className="block text-xs font-semibold text-[color:var(--ink)]">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">{option.description}</span>
              </span>
              <span className="tnum shrink-0 text-xs font-bold" style={{ color: '#8a6209' }}>
                +{COIN_AMOUNTS[option.action]} FC
              </span>
            </button>
          ))}
        </div>
      )}

      {pending && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Подтверждение</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]">{pending.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            Проверка: основание уникально, дневной лимит не превышен, авторство зафиксировано.
          </p>
          <p className="tnum mt-2 text-sm font-bold" style={{ color: '#8a6209' }}>
            +{COIN_AMOUNTS[pending.action]} FinCoin
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              disabled={validating}
              className="min-h-[44px] rounded-xl border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={confirmAward}
              disabled={validating}
              className="min-h-[44px] rounded-xl text-sm font-semibold text-white disabled:opacity-70"
              style={{ background: 'var(--brand)' }}
            >
              {validating ? 'Проверка…' : 'Подтвердить'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div
          role="status"
          className="mt-3 rounded-xl p-3 text-xs"
          style={
            result.ok
              ? { background: 'var(--mint-soft)', color: '#0b6b62' }
              : { background: '#fde8e6', color: 'var(--danger)' }
          }
        >
          {result.text}
        </div>
      )}
    </div>
  );
};

export default AwardButton;
