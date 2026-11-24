// Типы компетенций
export type CompetencyId =
  | 'data' | 'code' | 'finance' | 'comm'
  | 'research' | 'entre' | 'ai' | 'lead';

// Типы ценностей (будет заполнен командой)
export type ValueId = string; // id из data/values.ts, всего 10 [ВСТАВИТЬ]

// Цифровой двойник студента
export interface StudentTwin {
  id: string;
  displayName: string;
  course: 1 | 2 | 3 | 4;
  competencies: Record<CompetencyId, { level: number; target: number }>; // 0..100
  interests: string[];
  completedModules: string[];
  weeklyHours: number;
  isMock: true;
}

// Микромодуль
export interface Micromodule {
  id: string;
  title: string;
  minutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  kind: 'learn' | 'practice' | 'mentor';
  gains: Partial<Record<CompetencyId, number>>;
  valueTags: ValueId[];
}

// Задача партнера
export interface PartnerTask {
  id: string;
  title: string;
  partnerLabel: string; // текстом, без логотипов
  summary: string;
  required: Partial<Record<CompetencyId, number>>;
  difficulty: 1 | 2 | 3 | 4 | 5;
  weeks: number;
  tags: string[];
  isMock: true;
}

// Результат матча
export interface MatchResult {
  taskId: string;
  score: number; // 0..100
  factors: { label: string; weight: number; value: number }[];
  isStretch: boolean;
  explanation: string;
}

// Типы действий для FinCoin
export type FinCoinAction =
  | 'ai_training_data' | 'data_challenge' | 'mentoring'
  | 'anomaly_report' | 'market_value' | 'knowledge_export';

// Запись в реестре FinCoin
export interface LedgerEntry {
  id: string;
  ts: number;
  action: FinCoinAction;
  amount: number;
  basis: string; // за что именно начислено, показывается в ленте
  valueIds: ValueId[];
  prevHash: string;
  hash: string;
}

// Решение этического комитета
export interface EthicsDecision {
  id: string;
  ts: number;
  module: 'matcher' | 'twin' | 'wallet' | 'decomposer' | 'patents';
  ruleId: string;
  summary: string;
  considered: { id: string; label: string }[];
  rejected: { id: string; reason: string; valueId: ValueId }[];
  chosen: string;
  valueIds: ValueId[];
}

// Барьер
export interface Barrier {
  id: string;
  category: 'administrative' | 'informational' | 'cultural';
  title: string;
  stage: 'search' | 'agreement' | 'launch' | 'evaluation' | 'scale';
  severity: 0 | 1 | 2 | 3; // экспертная оценка команды
  solvedBy: string; // id модуля продукта
  note: string;
}