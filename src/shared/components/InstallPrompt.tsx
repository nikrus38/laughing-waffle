import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'fintwin-install-dismissed';

/**
 * Баннер установки PWA. Показывается, только если браузер прислал beforeinstallprompt,
 * то есть установка реально доступна. На iOS события нет — там инструкция в лендинге.
 */
const InstallPrompt: React.FC = () => {
  const location = useLocation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => window.localStorage.getItem(STORAGE_KEY) === '1',
  );

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || dismissed || location.pathname !== '/') return null;

  return (
    <div
      className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:bottom-6 lg:left-auto lg:right-6 lg:w-[340px] lg:translate-x-0"
      role="region"
      aria-label="Установка приложения"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--brand-soft)' }}
          aria-hidden="true"
        >
          <img
            src="/static/web/brand/icon-192.png"
            alt=""
            className="h-7 w-7 rounded object-contain"
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[color:var(--ink)]">Установить ФинТвин</p>
          <p className="mt-0.5 text-[11px] leading-snug text-[color:var(--ink-muted)]">
            Отдельное окно, запуск с рабочего стола и офлайн-оболочка.
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1');
            setDismissed(true);
          }}
          className="min-h-[40px] flex-1 rounded-lg border border-slate-300 text-xs font-medium text-slate-600"
        >
          Позже
        </button>
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
          }}
          className="min-h-[40px] flex-1 rounded-lg text-xs font-semibold text-white"
          style={{ background: 'var(--brand)' }}
        >
          Установить
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
