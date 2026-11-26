// Корпоративные ценности университета.
// ВАЖНО: официальные формулировки ещё не переданы командой — text = null,
// интерфейс показывает «текст уточняется». Названия и наши правила — не цитаты.

export interface Value {
  id: string;
  name: string;
  text: string | null; // null — официальная формулировка уточняется
}

export const mockValues: Value[] = [
  { id: 'excellence', name: 'Стремление к совершенству', text: null },
  { id: 'integrity', name: 'Честность и порядочность', text: null },
  { id: 'innovation', name: 'Инновационность', text: null },
  { id: 'collaboration', name: 'Коллаборация', text: null },
  { id: 'leadership', name: 'Лидерство', text: null },
  { id: 'sustainability', name: 'Устойчивость', text: null },
  { id: 'diversity', name: 'Разнообразие', text: null },
  { id: 'responsibility', name: 'Ответственность', text: null },
  { id: 'excellence2', name: 'Превосходство', text: null },
  { id: 'patriotism', name: 'Патриотизм', text: null },
];

export interface ValueRule {
  id: string;
  valueId: string;
  module: 'matcher' | 'twin' | 'wallet' | 'decomposer' | 'patents';
  title: string;
  /** Как правило зашито в алгоритм — наше описание, не официальная формулировка */
  algorithm: string;
  without: string;
  with: string;
}

// Правила этического фильтра. Это проектное решение команды,
// а не текст ценностей университета.
export const mockEthicsRules: ValueRule[] = [
  {
    id: 'MATCH-001',
    valueId: 'excellence',
    module: 'matcher',
    title: 'Минимум одна задача на вырост',
    algorithm:
      'В первой тройке рекомендаций всегда есть задача на вырост. Если все три лёгкие, самая простая вытесняется лучшей из трудных, а в журнал пишется причина.',
    without: 'Алгоритм показывает только простые задачи — быстрые баллы, нулевой рост.',
    with: 'Третья карточка — задача на вырост, и это явно подписано.',
  },
  {
    id: 'WALLET-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Награда не единственное основание',
    algorithm:
      'Рекомендации ранжируются по вкладу в развитие, а не по размеру награды. Дневные лимиты не дают «нафармить» FinCoin.',
    without: 'Студенту предлагают действие только потому, что за него больше монет.',
    with: 'Сначала развитие и вклад, размер награды — вторичен.',
  },
  {
    id: 'LEDGER-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Авторство и целостность реестра',
    algorithm:
      'У идей и модулей хранится автор. Одно основание нельзя засчитать дважды. Каждая запись хранит хэш предыдущей, цепочка проверяема.',
    without: 'Чужая идея засчитана как своя, запись можно тихо переписать.',
    with: 'Автор зафиксирован, подмена записи ломает цепочку хэшей.',
  },
  {
    id: 'EXPORT-001',
    valueId: 'patriotism',
    module: 'wallet',
    title: 'Экспорт знаний',
    algorithm:
      'Отдельное действие +70 FinCoin за открытый модуль по истории российской финансовой инженерии. Награда добавляется, но не принуждает и не обесценивает другие действия.',
    without: 'Открытые образовательные материалы не замечаются системой.',
    with: 'Модуль, которым пользуются другие платформы, отмечен и вознаграждён.',
  },
  {
    id: 'TWIN-001',
    valueId: 'excellence2',
    module: 'twin',
    title: 'Двойник показывает рост, а не рейтинг',
    algorithm:
      'Интерфейс не сравнивает студентов между собой. Показываются уровень, цель и зона ближайшего развития.',
    without: 'Экран рейтинга «кто лучше» — сравнение людей вместо развития.',
    with: 'Радар компетенций со своей целью и зоной роста.',
  },
];

/** Правило для ценности (если есть) */
export function getRuleForValue(valueId: string): ValueRule | undefined {
  return mockEthicsRules.find((rule) => rule.valueId === valueId);
}

/** Название ценности по id */
export function getValueName(valueId: string): string {
  return mockValues.find((value) => value.id === valueId)?.name ?? valueId;
}
