import { EthicsDecision } from './types';

/**
 * Этический фильтр (policy engine)
 */

// Интерфейс правила этики
export interface EthicsRule {
  id: string;
  valueId: string;
  module: string;
  title: string;
  description: string;
  check: (context: any) => EthicsDecision | null;
}

// Примеры правил (заглушки)
export const ethicsRules: EthicsRule[] = [
  {
    id: 'MATCH-001',
    valueId: 'excellence',
    module: 'matcher',
    title: 'Минимум одна задача на вырост',
    description: 'В первой тройке рекомендаций минимум одна задача на вырост',
    check: (context: any) => {
      // В реальной реализации здесь была бы логика проверки
      return null; // Заглушка
    }
  },
  {
    id: 'WALLET-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Приоритет духовного над материальным',
    description: 'FinCoin не может быть единственным основанием рекомендации',
    check: (context: any) => {
      return null; // Заглушка
    }
  },
  {
    id: 'LEDGER-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Порядочность',
    description: 'Каждая идея и модуль имеют зафиксированного автора',
    check: (context: any) => {
      return null; // Заглушка
    }
  },
  {
    id: 'EXPORT-001',
    valueId: 'patriotism',
    module: 'wallet',
    title: 'Патриотизм',
    description: 'Действие "экспорт знаний" поощряет открытые модули по истории российской финансовой инженерии',
    check: (context: any) => {
      return null; // Заглушка
    }
  },
  {
    id: 'TWIN-001',
    valueId: 'personality',
    module: 'twin',
    title: 'Личность',
    description: 'Двойник показывает рост и сильные стороны, а не рейтинг',
    check: (context: any) => {
      return null; // Заглушка
    }
  }
];

/**
 * Применение этического фильтра к кандидатам
 */
export function applyEthicsFilter(candidates: any[], context: any): { 
  filtered: any[]; 
  decisions: EthicsDecision[] 
} {
  const decisions: EthicsDecision[] = [];
  let filteredCandidates = [...candidates];
  
  // Применяем правила по порядку
  for (const rule of ethicsRules) {
    // В реальной реализации здесь была бы логика применения правил
    // Для демо просто создаем запись о применении правила
    const decision: EthicsDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ts: Date.now(),
      module: rule.module as any,
      ruleId: rule.id,
      summary: `Применено правило: ${rule.title}`,
      considered: [],
      rejected: [],
      chosen: '',
      valueIds: [rule.valueId]
    };
    
    decisions.push(decision);
  }
  
  return {
    filtered: filteredCandidates,
    decisions
  };
}

/**
 * Создание записи этического решения
 */
export function createEthicsDecision(
  module: string,
  ruleId: string,
  summary: string,
  considered: { id: string; label: string }[],
  rejected: { id: string; reason: string; valueId: string }[],
  chosen: string,
  valueIds: string[]
): EthicsDecision {
  return {
    id: `ethics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ts: Date.now(),
    module: module as any,
    ruleId,
    summary,
    considered,
    rejected,
    chosen,
    valueIds
  };
}

/**
 * MATCH-001 → «Первенство»: в первой тройке рекомендаций минимум одна задача
 * на вырост. Если все три лёгкие, самая лёгкая вытесняется лучшей «трудной».
 * Возвращает переупорядоченный список и запись для этического журнала.
 */
export function ensureStretchInTop3(
  matches: Array<{ taskId: string; title: string; isStretch: boolean; score: number }>
): {
  ordered: Array<{ taskId: string; title: string; isStretch: boolean; score: number }>;
  decision: EthicsDecision | null;
} {
  const ordered = [...matches].sort((a, b) => b.score - a.score);
  const top3 = ordered.slice(0, 3);

  if (top3.some((match) => match.isStretch)) {
    return { ordered, decision: null };
  }

  const stretchCandidate = ordered.find((match) => match.isStretch);
  if (!stretchCandidate) {
    // Нет ни одной задачи на вырост — правило применить нельзя
    return { ordered, decision: null };
  }

  // Вытесняем самую слабую из первой тройки: она уходит ниже, но не пропадает
  const displaced = top3[top3.length - 1]!;
  const withoutStretch = ordered.filter((match) => match.taskId !== stretchCandidate.taskId);
  const insertAt = Math.min(2, withoutStretch.length);
  withoutStretch.splice(insertAt, 0, stretchCandidate);

  const decision = createEthicsDecision(
    'matcher',
    'MATCH-001',
    'В первую тройку добавлена задача на вырост',
    top3.map((match) => ({ id: match.taskId, label: match.title })),
    [
      {
        id: displaced.taskId,
        reason: 'Все три задачи были лёгкими — самая простая вытеснена',
        valueId: 'excellence',
      },
    ],
    stretchCandidate.taskId,
    ['excellence']
  );

  return { ordered: withoutStretch, decision };
}