import { Micromodule } from '../domain/types';

// Моковые микромодули
export const mockMicromodules: Micromodule[] = [
  {
    id: 'mm-1',
    title: 'Основы работы с большими данными',
    minutes: 30,
    difficulty: 2,
    kind: 'learn',
    gains: {
      'data': 15
    },
    valueTags: ['learning'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  },
  {
    id: 'mm-2',
    title: 'Введение в машинное обучение',
    minutes: 45,
    difficulty: 3,
    kind: 'learn',
    gains: {
      'ai': 20,
      'data': 10
    },
    valueTags: ['innovation'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  },
  {
    id: 'mm-3',
    title: 'Финансовая математика',
    minutes: 40,
    difficulty: 2,
    kind: 'learn',
    gains: {
      'finance': 25
    },
    valueTags: ['expertise'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  },
  {
    id: 'mm-4',
    title: 'Практика анализа финансовых отчетов',
    minutes: 60,
    difficulty: 3,
    kind: 'practice',
    gains: {
      'finance': 20,
      'research': 15
    },
    valueTags: ['practice'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  },
  {
    id: 'mm-5',
    title: 'Разработка чат-бота с использованием NLP',
    minutes: 90,
    difficulty: 4,
    kind: 'practice',
    gains: {
      'code': 25,
      'ai': 20,
      'comm': 10
    },
    valueTags: ['innovation', 'technology'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  },
  {
    id: 'mm-6',
    title: 'Наставничество по основам программирования',
    minutes: 120,
    difficulty: 2,
    kind: 'mentor',
    gains: {
      'lead': 30,
      'comm': 20
    },
    valueTags: ['mentoring', 'community'] // [ВСТАВИТЬ ОФИЦИАЛЬНЫЕ ЦЕННОСТИ]
  }
];