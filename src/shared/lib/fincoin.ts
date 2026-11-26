import { FinCoinAction } from '../../domain/types';

export const ACTION_NAMES: Record<FinCoinAction, string> = {
  ai_training_data: 'Данные для обучения ИИ',
  data_challenge: 'Решение Data Challenge',
  mentoring: 'Наставничество',
  anomaly_report: 'Отчёт об аномалии',
  market_value: 'Рыночная ценность',
  knowledge_export: 'Экспорт знаний',
};

export const ACTION_ICONS: Record<FinCoinAction, string> = {
  ai_training_data: '🤖',
  data_challenge: '📊',
  mentoring: '🧑‍🏫',
  anomaly_report: '⚠️',
  market_value: '💼',
  knowledge_export: '📚',
};
