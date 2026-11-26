import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Минимальная интеграция Telegram Mini App без внешних SDK:
 * - ready/expand, светлая шапка, фон;
 * - BackButton синхронизирован с историей роутера;
 * - startapp-ссылки открывают нужный экран.
 * В обычном браузере всё аккуратно выключается (window.Telegram отсутствует).
 */

interface TelegramWebApp {
  ready?: () => void;
  expand?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback?: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  };
  initDataUnsafe?: { start_param?: string };
}

export function getTelegram(): TelegramWebApp | null {
  const candidate = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram;
  return candidate?.WebApp ?? null;
}

export function haptic(type: 'success' | 'warning' | 'error'): void {
  getTelegram()?.HapticFeedback?.notificationOccurred(type);
}

const START_PARAM_ROUTES: Record<string, string> = {
  'scenario-1': '/matcher',
  'scenario-2': '/decomposer',
  'scenario-3': '/ethics',
  'scenario_1': '/matcher',
  'scenario_2': '/decomposer',
  'scenario_3': '/ethics',
};

const TelegramBridge: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;

    tg.ready?.();
    tg.expand?.();
    tg.setHeaderColor?.('#ffffff');
    tg.setBackgroundColor?.('#f5f7fa');

    const startParam = tg.initDataUnsafe?.start_param;
    if (startParam && !window.sessionStorage.getItem('fintwin-start-param')) {
      window.sessionStorage.setItem('fintwin-start-param', startParam);
      const route = START_PARAM_ROUTES[startParam];
      if (route) navigate(route, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const tg = getTelegram();
    if (!tg?.BackButton) return;

    const handler = () => navigate(-1);
    tg.BackButton.onClick(handler);
    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    return () => {
      tg.BackButton?.offClick(handler);
    };
  }, [location.pathname, navigate]);

  return null;
};

export default TelegramBridge;
