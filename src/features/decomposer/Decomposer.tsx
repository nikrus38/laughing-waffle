import React, { useMemo, useState } from 'react';
import { api } from '../../shared/api/client';
import { useStore } from '../../shared/store/useStore';

interface ServerCase {
  title: string;
  course: 1 | 2 | 3 | 4;
  competency: string;
  coins: number;
}

interface ServerDecomposition {
  title: string;
  partner: string;
  cases: ServerCase[];
  totalCoins: number;
  source: 'preset' | 'generated';
}

const COMPETENCY_LABELS: Record<string, string> = {
  data: 'Данные',
  code: 'Программирование',
  finance: 'Финансы',
  comm: 'Коммуникация',
  research: 'Исследование',
  entre: 'Предпринимательство',
  ai: 'ИИ',
  lead: 'Лидерство',
};

interface CaseItem {
  title: string;
  course: 1 | 2 | 3 | 4;
  competency: string;
  coins: number;
}

interface Preset {
  id: string;
  label: string;
  partner: string;
  cases: CaseItem[];
}

// MOCK: готовые примеры декомпозиции для демо
const PRESETS: Preset[] = [
  {
    id: 'churn',
    label: 'Прогноз оттока клиентов',
    partner: 'Крупный банк (пример)',
    cases: [
      { title: 'Собрать и очистить исторические данные', course: 1, competency: 'Данные', coins: 20 },
      { title: 'Описательная статистика и гипотезы', course: 1, competency: 'Исследования', coins: 20 },
      { title: 'Логистическая регрессия и валидация', course: 3, competency: 'ИИ', coins: 100 },
      { title: 'Перевести модель на язык бизнеса', course: 3, competency: 'Финансы', coins: 50 },
      { title: 'Пилот у партнёра и сбор обратной связи', course: 4, competency: 'Предпринимательство', coins: 100 },
    ],
  },
  {
    id: 'chatbot',
    label: 'Чат-бот консультаций',
    partner: 'Финтех-компания (пример)',
    cases: [
      { title: 'Разметить частые вопросы клиентов', course: 1, competency: 'Коммуникация', coins: 20 },
      { title: 'Собрать прототип на готовом API', course: 2, competency: 'Программирование', coins: 50 },
      { title: 'Оценить качество ответов', course: 3, competency: 'ИИ', coins: 50 },
      { title: 'Подготовить сценарии эскалации оператору', course: 3, competency: 'Коммуникация', coins: 20 },
      { title: 'Запустить пилот и посчитать эффект', course: 4, competency: 'Предпринимательство', coins: 100 },
    ],
  },
  {
    id: 'security',
    label: 'Аудит безопасности учебного стенда',
    partner: 'ИТ-департамент (пример)',
    cases: [
      { title: 'Инвентаризация сервисов и доступов', course: 1, competency: 'Данные', coins: 20 },
      { title: 'Поиск типовых уязвимостей', course: 2, competency: 'Программирование', coins: 50 },
      { title: 'Отчёт и приоритизация рисков', course: 3, competency: 'Исследования', coins: 50 },
      { title: 'Исправление и повторная проверка', course: 3, competency: 'Программирование', coins: 50 },
      { title: 'Регламент для младших курсов', course: 4, competency: 'Лидерство', coins: 50 },
    ],
  },
];

const COURSE_LABELS: Record<number, string> = {
  1: '1 курс',
  2: '2 курс',
  3: '3 курс',
  4: '4 курс',
};

const Decomposer: React.FC = () => {
  const [presetId, setPresetId] = useState(PRESETS[0]!.id);
  const [customTitle, setCustomTitle] = useState('');
  const [built, setBuilt] = useState(false);
  const [result, setResult] = useState<Preset | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mode = useStore((state) => state.mode);

  const preset = useMemo(
    () => PRESETS.find((item) => item.id === presetId) ?? PRESETS[0]!,
    [presetId],
  );

  const shown = result ?? preset;
  const totalCoins = shown.cases.reduce((sum, item) => sum + item.coins, 0);
  const title = customTitle.trim() || shown.label;

  const handleBuild = async () => {
    setLoading(true);
    setNote(null);

    if (mode === 'server') {
      try {
        const data = await api.post<ServerDecomposition>('/api/decompose/', {
          preset: presetId,
          title: customTitle.trim(),
        });
        setResult({
          id: presetId,
          label: data.title,
          partner: data.partner,
          cases: data.cases.map((item) => ({
            title: item.title,
            course: item.course,
            competency: COMPETENCY_LABELS[item.competency] ?? item.competency,
            coins: item.coins,
          })),
        });
        setNote(
          data.source === 'preset'
            ? 'Готовый пример рассчитан на сервере'
            : 'Кейсы сгенерированы на сервере по тегам задачи',
        );
      } catch {
        setResult(preset);
        setNote('Сервер недоступен — показан локальный пример');
      }
    } else {
      setResult(preset);
      setNote('Локальный демо-режим: кейсы собраны в браузере');
    }

    setBuilt(true);
    setLoading(false);
  };

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-[color:var(--ink)]">Декомпозиция задач</h1>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Роль «Партнёр и кафедра»: один запрос индустрии превращается в учебные кейсы для разных курсов.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="task-title" className="block text-sm font-medium text-[color:var(--ink)]">
          Новая задача партнёра
        </label>
        <input
          id="task-title"
          type="text"
          value={customTitle}
          onChange={(event) => setCustomTitle(event.target.value)}
          placeholder={preset.label}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand)]"
        />

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Готовые примеры</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPresetId(item.id);
                setBuilt(false);
              }}
              aria-pressed={item.id === presetId}
              className={[
                'min-h-[36px] rounded-full border px-3 text-xs font-medium transition-colors',
                item.id === presetId
                  ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-[color:var(--brand)]'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleBuild}
          disabled={loading}
          className="mt-4 min-h-[44px] w-full rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          style={{ background: 'var(--brand)' }}
        >
          {loading ? 'Раскладываем…' : 'Разложить на учебные кейсы'}
        </button>
      </section>

      {built && (
        <section className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Задача партнёра</p>
            <h2 className="mt-1 text-base font-semibold text-[color:var(--ink)]">{title}</h2>
            <p className="text-xs text-slate-500">{shown.partner}</p>
          </div>

          <div className="mt-3 space-y-2">
            {shown.cases.map((item, index) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-slate-200 bg-white p-4 pl-9"
              >
                <span
                  className="absolute left-3 top-5 h-2 w-2 rounded-full"
                  style={{ background: 'var(--mint)' }}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--ink)]">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {COURSE_LABELS[item.course]} · {item.competency}
                    </p>
                  </div>
                  <span
                    className="tnum shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                    style={{ background: 'var(--gold-soft)', color: '#8a6209' }}
                  >
                    +{item.coins} FC
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Шаг {index + 1} из {shown.cases.length}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-3 flex items-center justify-between rounded-2xl p-4 text-sm font-semibold"
            style={{ background: 'var(--mint-soft)', color: '#0b6b62' }}
          >
            <span>Итого FinCoin за сквозную задачу</span>
            <span className="tnum">{totalCoins} FC</span>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {note ? `${note}. ` : ''}
            Набор кейсов зависит от типа задачи. В реальной системе кейсы подбирались бы по
            компетенциям и содержанию курсов.
          </p>
        </section>
      )}
    </div>
  );
};

export default Decomposer;
