import React, { useState } from 'react';

interface FlowNode {
  id: string;
  label: string;
  group: 'source' | 'core' | 'result';
  uses: string[];
  purpose: string;
  notCollected?: string[];
}

// MOCK: схема иллюстративная, описывает принцип, а не реальные интеграции
const NODES: FlowNode[] = [
  {
    id: 'study',
    label: 'Учебный процесс',
    group: 'source',
    uses: ['Пройденные модули', 'Результаты мини-тестов', 'Темы курсовых'],
    purpose: 'Показать реальный уровень компетенций, а не средний балл.',
    notCollected: ['Медицинские данные', 'Сведения о семье'],
  },
  {
    id: 'portfolio',
    label: 'Портфолио',
    group: 'source',
    uses: ['Проекты и роли', 'Ссылки на репозитории', 'Сертификаты'],
    purpose: 'Подтвердить навыки практикой и связать их с задачами партнёров.',
  },
  {
    id: 'projects',
    label: 'Проекты',
    group: 'source',
    uses: ['Этапы задачи', 'Вклад участника', 'Обратная связь наставника'],
    purpose: 'Видеть, где студент реально вырос, и корректировать рекомендации.',
  },
  {
    id: 'market',
    label: 'Рынок труда',
    group: 'source',
    uses: ['Открытые вакансии', 'Требуемые навыки', 'Динамика спроса'],
    purpose: 'Сверять программу с тем, что нужно индустрии сегодня и через 3–5 лет.',
  },
  {
    id: 'patents',
    label: 'Патенты',
    group: 'source',
    uses: ['Аннотации патентов', 'Кластеры тем', 'Динамика роста'],
    purpose: 'Подсказывать кафедрам темы, которые стоит усилить в программе.',
  },
  {
    id: 'partners',
    label: 'Запросы партнёров',
    group: 'source',
    uses: ['Формулировка задачи', 'Требуемые компетенции', 'Срок'],
    purpose: 'Превращать запрос индустрии в учебные кейсы без ручной работы методистов.',
  },
  {
    id: 'twin',
    label: 'Цифровой двойник',
    group: 'core',
    uses: ['8 компетенций', 'Целевой профиль', 'Зона ближайшего развития'],
    purpose: 'Хранить модель развития студента и объяснять каждую рекомендацию.',
    notCollected: ['Пол и возраст для расчёта', 'Происхождение', 'Средний балл для ранжирования'],
  },
  {
    id: 'match',
    label: 'Матчинг',
    group: 'core',
    uses: ['Профиль компетенций', 'Теги интересов', 'Свободные часы'],
    purpose: 'Подбирать задачи по развитию, а не по удобству или полу.',
    notCollected: ['Паспортные данные', 'Геолокация'],
  },
  {
    id: 'predict',
    label: 'Предиктив',
    group: 'core',
    uses: ['Временные ряды вакансий', 'Патентные кластеры', 'Отчёты партнёров'],
    purpose: 'Показывать прогноз спроса на навыки и обновлять программы заранее.',
  },
  {
    id: 'recommend',
    label: 'Рекомендации',
    group: 'result',
    uses: ['Следующий микромодуль', 'Задача партнёра', 'Тема наставничества'],
    purpose: 'Дать студенту понятный следующий шаг с объяснением «почему так».',
  },
  {
    id: 'tasks',
    label: 'Задачи',
    group: 'result',
    uses: ['Карточки задач', 'План первого месяца', 'Кейсы по курсам'],
    purpose: 'Соединить учёбу с реальной работой индустрии.',
  },
  {
    id: 'fincoin',
    label: 'FinCoin',
    group: 'result',
    uses: ['Реестр начислений', 'Основания', 'Цепочка хэшей'],
    purpose: 'Фиксировать вклад и авторство, а не активность.',
  },
];

const GROUP_LABELS: Record<FlowNode['group'], string> = {
  source: 'Источники',
  core: 'Ядро',
  result: 'Результаты',
};

const DataFlowDiagram: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('twin');
  const active = NODES.find((node) => node.id === activeId)!;

  const groups: FlowNode['group'][] = ['source', 'core', 'result'];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-[color:var(--ink)]">Потоки данных</h2>
      <p className="mt-1 text-[11px] text-slate-500">
        На каждом ребре работает этический фильтр: данные собираются только под конкретную задачу.
      </p>

      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {GROUP_LABELS[group]}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {NODES.filter((node) => node.group === group).map((node) => {
                const isActive = node.id === activeId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveId(node.id)}
                    aria-pressed={isActive}
                    className="min-h-[36px] rounded-full border px-2.5 text-[11px] font-medium transition-colors"
                    style={
                      isActive
                        ? { background: 'var(--brand)', borderColor: 'var(--brand)', color: '#fff' }
                        : { background: 'var(--brand-soft)', borderColor: 'transparent', color: 'var(--brand)' }
                    }
                  >
                    {node.id === 'twin' || node.id === 'match' || node.id === 'predict' ? '🛡 ' : ''}
                    {node.label}
                  </button>
                );
              })}
            </div>
            {group !== 'result' && (
              <p className="mt-1 text-center text-sm text-slate-300" aria-hidden="true">
                ↓
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <h3 className="text-xs font-semibold text-[color:var(--ink)]">
          {active.label}
          <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-500">
            {GROUP_LABELS[active.group]}
          </span>
        </h3>

        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Какие данные
        </p>
        <ul className="mt-1 flex flex-wrap gap-1">
          {active.uses.map((item) => (
            <li
              key={item}
              className="rounded px-1.5 py-0.5 text-[10px]"
              style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Зачем
        </p>
        <p className="mt-0.5 text-xs text-slate-700">{active.purpose}</p>

        {active.notCollected && (
          <>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Что принципиально не собирается
            </p>
            <ul className="mt-0.5 space-y-0.5">
              {active.notCollected.map((item) => (
                <li key={item} className="text-[11px] text-slate-600">
                  ✕ {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default DataFlowDiagram;
