// Временные заглушки для корпоративных ценностей университета
// [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ФОРМУЛИРОВКИ ОТ КОМАНДЫ]

export interface Value {
  id: string;
  name: string;
  text: string | null; // null означает, что текст уточняется
}

export const mockValues: Value[] = [
  {
    id: 'excellence',
    name: 'Стремление к совершенству',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'integrity',
    name: 'Честность и порядочность',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'innovation',
    name: 'Инновационность',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'collaboration',
    name: 'Коллаборация',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'leadership',
    name: 'Лидерство',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'sustainability',
    name: 'Устойчивость',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'diversity',
    name: 'Разнообразие',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'responsibility',
    name: 'Ответственность',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'excellence2',
    name: 'Превосходство',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  },
  {
    id: 'patriotism',
    name: 'Патриотизм',
    text: '[ВСТАВИТЬ ОФИЦИАЛЬНЫЙ ТЕКСТ]'
  }
];

// Правила для этического фильтра (заглушки)
export const mockEthicsRules = [
  {
    id: 'MATCH-001',
    valueId: 'excellence',
    module: 'matcher',
    title: 'Стремление к сложным задачам',
    description: '[ВСТАВИТЬ ОФИЦИАЛЬНОЕ ОПИСАНИЕ ПРАВИЛА]'
  },
  {
    id: 'WALLET-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Честность в начислении наград',
    description: '[ВСТАВИТЬ ОФИЦИАЛЬНОЕ ОПИСАНИЕ ПРАВИЛА]'
  },
  {
    id: 'LEDGER-001',
    valueId: 'integrity',
    module: 'wallet',
    title: 'Порядочность в авторстве',
    description: '[ВСТАВИТЬ ОФИЦИАЛЬНОЕ ОПИСАНИЕ ПРАВИЛА]'
  },
  {
    id: 'EXPORT-001',
    valueId: 'patriotism',
    module: 'wallet',
    title: 'Патриотизм в экспортных знаниях',
    description: '[ВСТАВИТЬ ОФИЦИАЛЬНОЕ ОПИСАНИЕ ПРАВИЛА]'
  },
  {
    id: 'TWIN-001',
    valueId: 'excellence2',
    module: 'twin',
    title: 'Фокус на развитии личности',
    description: '[ВСТАВИТЬ ОФИЦИАЛЬНОЕ ОПИСАНИЕ ПРАВИЛА]'
  }
];