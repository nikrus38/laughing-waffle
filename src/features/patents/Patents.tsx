import React, { useState } from 'react';

interface PatentTopic {
  id: string;
  title: string;
  maturity: number; // 0..100
  potential: number; // 0..100
  patents: number;
  suggestion: string;
}

// MOCK: цифры демонстрационные, не результат реального патентного поиска
const TOPICS: PatentTopic[] = [
  {
    id: 'p1',
    title: 'Скоринг на альтернативных данных',
    maturity: 72,
    potential: 84,
    patents: 38,
    suggestion: 'Добавить в курс «Кредитный риск» блок про альтернативные данные и валидацию моделей.',
  },
  {
    id: 'p2',
    title: 'Фрод-аналитика в реальном времени',
    maturity: 66,
    potential: 78,
    patents: 31,
    suggestion: 'Усилить практикум по потоковой обработке данных кейсами антифрода.',
  },
  {
    id: 'p3',
    title: 'Объяснимый ИИ в финансах',
    maturity: 48,
    potential: 88,
    patents: 24,
    suggestion: 'Ввести модуль по интерпретируемости моделей — высокий потенциал, зрелость ещё низкая.',
  },
  {
    id: 'p4',
    title: 'Цифровой рубль и платежи',
    maturity: 54,
    potential: 71,
    patents: 19,
    suggestion: 'Обновить раздел платёжных систем, добавить разбор сценариев цифрового рубля.',
  },
  {
    id: 'p5',
    title: 'Федеративное обучение',
    maturity: 34,
    potential: 82,
    patents: 15,
    suggestion: 'Тема для научного семинара: приватность данных и федеративные модели.',
  },
  {
    id: 'p6',
    title: 'Квантово-устойчивая криптография',
    maturity: 28,
    potential: 74,
    patents: 12,
    suggestion: 'Факультатив для 3–4 курса: постквантовые схемы и их применение в банках.',
  },
  {
    id: 'p7',
    title: 'ESG-скоринг компаний',
    maturity: 61,
    potential: 63,
    patents: 21,
    suggestion: 'Добавить кейс по ESG-данным в курс устойчивого финансирования.',
  },
  {
    id: 'p8',
    title: 'Речевая аналитика контакт-центра',
    maturity: 70,
    potential: 58,
    patents: 27,
    suggestion: 'Практикум по обработке речи можно собрать на открытых датасетах.',
  },
];

const Patents: React.FC = () => {
  const [selectedId, setSelectedId] = useState(TOPICS[0]!.id);
  const selected = TOPICS.find((topic) => topic.id === selectedId)!;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Радар патентов</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Предиктивная наука: темы, которые стоит усилить в программе.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Зрелость →</span>
          <span>↑ Потенциал</span>
        </div>

        <div className="relative mt-2 h-56 w-full rounded-xl bg-slate-50">
          {TOPICS.map((topic) => {
            const size = 14 + Math.min(topic.patents, 40) * 0.5;
            const isActive = topic.id === selectedId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedId(topic.id)}
                aria-label={`${topic.title}: зрелость ${topic.maturity}, потенциал ${topic.potential}`}
                aria-pressed={isActive}
                className="absolute rounded-full border-2 transition-transform hover:scale-110 focus-visible:scale-110"
                style={{
                  left: `calc(${topic.maturity}% - ${size / 2}px)`,
                  bottom: `calc(${topic.potential}% - ${size / 2}px)`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: isActive ? 'var(--mint)' : 'var(--brand-soft)',
                  borderColor: isActive ? '#0b6b62' : 'var(--brand)',
                }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Размер круга — число патентов. Все значения демонстрационные.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-[color:var(--ink)]">{selected.title}</h2>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-2">
            <dt className="text-[11px] text-slate-500">Зрелость</dt>
            <dd className="tnum text-sm font-semibold">{selected.maturity}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <dt className="text-[11px] text-slate-500">Потенциал</dt>
            <dd className="tnum text-sm font-semibold">{selected.potential}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-2">
            <dt className="text-[11px] text-slate-500">Патенты</dt>
            <dd className="tnum text-sm font-semibold">{selected.patents}</dd>
          </div>
        </dl>

        <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--violet-soft)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--violet)' }}>
            Предложение кафедре
          </p>
          <p className="mt-1 text-sm text-slate-700">{selected.suggestion}</p>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-[color:var(--ink)]">Как это считалось бы по-настоящему</h2>
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          <li>• Векторные представления аннотаций патентов.</li>
          <li>• Кластеризация близких тем и динамика роста кластера.</li>
          <li>• Индекс потенциала — сочетание роста, цитируемости и отраслевого спроса.</li>
        </ul>
      </section>
    </div>
  );
};

export default Patents;
