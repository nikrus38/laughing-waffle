import { create } from 'zustand';
import {
  StudentTwin,
  PartnerTask,
  LedgerEntry,
  FinCoinAction,
  EthicsDecision,
  Micromodule,
  Barrier,
} from '../../domain/types';
import { mockStudent } from '../../data/students';
import { mockTasks } from '../../data/tasks';
import { mockMicromodules } from '../../data/modules';
import { updateTwinAfterModule } from '../../domain/twin';
import { createEthicsDecision } from '../../domain/ethics';
import { mockBarriers } from '../../data/barriers';
import { ValueRule } from '../../data/values';
import {
  createLedgerEntry,
  calculateEntryHash,
  checkDailyLimits,
  checkUniqueBasis,
  COIN_AMOUNTS,
} from '../../domain/ledger';
import { api, ApiError } from '../api/client';
import { AwardResponse, BootstrapPayload, CompleteModuleResponse } from '../api/types';

/**
 * Единое состояние демо.
 * Два режима:
 *  - local  — всё в памяти, данные из src/data (npm run dev, обычный браузер без сервера);
 *  - server — данные и правила приходят с Django API (продовый запуск в /app/).
 * Демо-история кошелька помечена как MOCK.
 */

const STARTER_ENTRIES: Array<{
  action: FinCoinAction;
  basis: string;
  valueIds: string[];
  daysAgo: number;
}> = [
  {
    action: 'data_challenge',
    basis: 'Data Challenge: прогноз оттока клиентов (пример задачи)',
    valueIds: ['excellence', 'innovation'],
    daysAgo: 12,
  },
  {
    action: 'mentoring',
    basis: 'Наставничество: модуль по визуализации данных для первокурсников',
    valueIds: ['collaboration', 'leadership'],
    daysAgo: 9,
  },
  {
    action: 'anomaly_report',
    basis: 'Отчёт об уязвимости в учебном стенде (пример)',
    valueIds: ['integrity'],
    daysAgo: 7,
  },
  {
    action: 'knowledge_export',
    basis: 'Открытый модуль по истории российской финансовой инженерии',
    valueIds: ['patriotism'],
    daysAgo: 5,
  },
  {
    action: 'ai_training_data',
    basis: 'Ошибки в микромодуле по статистике помогли улучшить ИИ-тьютора',
    valueIds: ['excellence'],
    daysAgo: 2,
  },
];

/** Собирает стартовую цепочку с корректными хэшами и сдвигом дат назад */
function buildStarterLedger(): LedgerEntry[] {
  let prevHash = '0'.repeat(64);
  const entries: LedgerEntry[] = [];

  for (const item of STARTER_ENTRIES) {
    const entry = createLedgerEntry(item.action, item.basis, item.valueIds, prevHash);
    entry.ts = Date.now() - item.daysAgo * 24 * 60 * 60 * 1000;
    entry.hash = calculateEntryHash(entry);
    prevHash = entry.hash;
    entries.push(entry);
  }

  return entries;
}

const initialLedger = buildStarterLedger();
const initialBalance = initialLedger.reduce((sum, entry) => sum + entry.amount, 0);

/** MOCK: стартовый журнал решений, чтобы экран этики не был пустым */
function buildStarterEthicsLog(): EthicsDecision[] {
  const entries: Array<{ decision: EthicsDecision; hoursAgo: number }> = [
    {
      hoursAgo: 1,
      decision: createEthicsDecision(
        'matcher',
        'MATCH-001',
        'В первую тройку добавлена задача на вырост',
        [
          { id: 'task-1', label: 'Анализ рыночных рисков' },
          { id: 'task-2', label: 'Разработка чат-бота' },
          { id: 'task-3', label: 'Прогноз оттока клиентов' },
        ],
        [
          {
            id: 'task-2',
            reason: 'Все три задачи были лёгкими — самая простая вытеснена',
            valueId: 'excellence',
          },
        ],
        'task-3',
        ['excellence'],
      ),
    },
    {
      hoursAgo: 3,
      decision: createEthicsDecision(
        'wallet',
        'WALLET-001',
        'Рекомендация не строится на размере награды',
        [
          { id: 'rec-1', label: 'Data Challenge: +100 FinCoin' },
          { id: 'rec-2', label: 'Микромодуль по статистике: +20 FinCoin' },
        ],
        [{ id: 'rec-1', reason: 'Единственное основание — размер награды', valueId: 'integrity' }],
        'rec-2',
        ['integrity'],
      ),
    },
    {
      hoursAgo: 6,
      decision: createEthicsDecision(
        'wallet',
        'LEDGER-001',
        'Дубль основания отклонён',
        [{ id: 'entry-dup', label: 'Повторная заявка на Data Challenge' }],
        [
          {
            id: 'entry-dup',
            reason: 'Основание уже засчитано ранее — дубли запрещены',
            valueId: 'integrity',
          },
        ],
        'entry-existing',
        ['integrity'],
      ),
    },
    {
      hoursAgo: 11,
      decision: createEthicsDecision(
        'twin',
        'TWIN-001',
        'Из рекомендаций убрано сравнение с другими студентами',
        [
          { id: 'mod-1', label: 'Рейтинг группы по среднему баллу' },
          { id: 'mod-2', label: 'Микромодуль из зоны ближайшего развития' },
        ],
        [{ id: 'mod-1', reason: 'Сравнение людей вместо развития', valueId: 'excellence2' }],
        'mod-2',
        ['excellence2'],
      ),
    },
    {
      hoursAgo: 20,
      decision: createEthicsDecision(
        'decomposer',
        'DECOMP-001',
        'Задача партнёра разложена без персональных данных',
        [
          { id: 'case-1', label: 'Кейс по очистке данных' },
          { id: 'case-2', label: 'Кейс с реальными данными клиентов' },
        ],
        [
          {
            id: 'case-2',
            reason: 'Кейс требует персональных данных реальных людей',
            valueId: 'responsibility',
          },
        ],
        'case-1',
        ['responsibility'],
      ),
    },
    {
      hoursAgo: 30,
      decision: createEthicsDecision(
        'wallet',
        'EXPORT-001',
        'Экспорт знаний отмечен отдельной наградой',
        [{ id: 'export-1', label: 'Открытый модуль по истории финансовой инженерии' }],
        [],
        'export-1',
        ['patriotism'],
      ),
    },
  ];

  return entries.map(({ decision, hoursAgo }) => ({
    ...decision,
    ts: Date.now() - hoursAgo * 60 * 60 * 1000,
  }));
}

export interface AwardResult {
  ok: boolean;
  reason?: string;
  amount?: number;
}

export type AppMode = 'local' | 'server';

interface AppState {
  mode: AppMode;
  hydrating: boolean;

  user: StudentTwin;
  setUser: (user: StudentTwin) => void;

  finCoinBalance: number;
  ledger: LedgerEntry[];

  availableTasks: PartnerTask[];
  appliedTaskIds: string[];
  skippedTaskIds: string[];
  modules: Micromodule[];
  completedModules: string[];

  /** Барьеры, ценности и правила: с сервера в режиме server, иначе локальные */
  barriers: Barrier[];
  serverValues: Array<{ id: string; name: string; text: string | null }> | null;
  serverRules: ValueRule[] | null;

  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  userRole: 'student' | 'partner';
  setUserRole: (role: 'student' | 'partner') => void;

  lastAward: { action: FinCoinAction; amount: number; basis: string } | null;

  ethicsLog: EthicsDecision[];
  logEthicsDecision: (decision: EthicsDecision) => void;

  /** Загрузить состояние с сервера (Django) */
  hydrate: (payload: BootstrapPayload) => void;
  /** Перечитать состояние с сервера */
  refresh: () => Promise<void>;

  award: (action: FinCoinAction, basis: string, valueIds?: string[]) => Promise<AwardResult>;
  completeModule: (moduleId: string, performance?: number) => Promise<AwardResult>;
  applyToTask: (taskId: string) => Promise<void>;
  skipTask: (taskId: string) => void;
  resetDemo: () => Promise<void>;
}

function twinFromPayload(payload: BootstrapPayload): StudentTwin {
  return {
    id: String(payload.user.id),
    displayName: payload.user.displayName,
    course: payload.user.course,
    competencies: payload.twin.competencies,
    interests: payload.twin.interests,
    completedModules: payload.twin.completedModules,
    weeklyHours: payload.twin.weeklyHours,
    isMock: true,
  };
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'local',
  hydrating: false,

  user: mockStudent,
  setUser: (user) => set({ user }),

  finCoinBalance: initialBalance,
  ledger: initialLedger,

  availableTasks: mockTasks,
  appliedTaskIds: [],
  skippedTaskIds: [],
  modules: mockMicromodules,

  barriers: mockBarriers,
  serverValues: null,
  serverRules: null,

  completedModules: [...mockStudent.completedModules],

  onboardingCompleted:
    typeof window !== 'undefined' && window.localStorage.getItem('fintwin-onboarding') === '1',
  setOnboardingCompleted: (completed) => {
    try {
      window.localStorage.setItem('fintwin-onboarding', completed ? '1' : '0');
    } catch {
      /* приватный режим браузера — просто не запоминаем */
    }
    set({ onboardingCompleted: completed });
  },

  userRole: 'student',
  setUserRole: (role) => {
    set({ userRole: role });
    if (get().mode === 'server') {
      void api.patch('/api/me/', { role }).catch(() => {
        /* роль — демонстрационный переключатель, ошибку не ломаем */
      });
    }
  },

  lastAward: null,

  ethicsLog: buildStarterEthicsLog(),

  logEthicsDecision: (decision) =>
    set((state) => {
      const exists = state.ethicsLog.some(
        (item) => item.ruleId === decision.ruleId && item.chosen === decision.chosen,
      );
      if (exists) return state;
      return { ethicsLog: [decision, ...state.ethicsLog] };
    }),

  hydrate: (payload) => {
    const tasks = payload.tasks as unknown as PartnerTask[];
    set({
      mode: 'server',
      hydrating: false,
      user: twinFromPayload(payload),
      finCoinBalance: payload.balance,
      ledger: payload.ledger,
      availableTasks: tasks,
      appliedTaskIds: payload.appliedTaskIds,
      modules: payload.modules,
      completedModules: payload.twin.completedModules,
      ethicsLog: payload.ethicsLog,
      barriers: payload.barriers.length > 0 ? payload.barriers : mockBarriers,
      serverValues: payload.values.length > 0 ? payload.values : null,
      serverRules: payload.ethicsRules.length > 0 ? (payload.ethicsRules as unknown as ValueRule[]) : null,
      userRole: payload.user.role,
    });
  },

  refresh: async () => {
    if (get().mode !== 'server') return;
    set({ hydrating: true });
    try {
      const payload = await api.get<BootstrapPayload>('/api/bootstrap/');
      get().hydrate(payload);
    } finally {
      set({ hydrating: false });
    }
  },

  award: async (action, basis, valueIds = []) => {
    if (get().mode === 'server') {
      try {
        const response = await api.post<AwardResponse>('/api/ledger/award/', {
          action,
          basis,
          valueIds,
        });
        await get().refresh();
        return { ok: true, amount: response.amount };
      } catch (error) {
        if (error instanceof ApiError) return { ok: false, reason: error.message };
        return { ok: false, reason: 'Сервер недоступен. Попробуйте ещё раз.' };
      }
    }

    const { ledger } = get();

    if (!checkUniqueBasis(ledger, basis)) {
      return {
        ok: false,
        reason: 'Это основание уже засчитано — дубли отклоняются (правило LEDGER-001).',
      };
    }

    if (!checkDailyLimits(ledger, action)) {
      return { ok: false, reason: 'Достигнут дневной лимит по этому типу действия.' };
    }

    const prevHash = ledger.length > 0 ? ledger[ledger.length - 1]!.hash : '0'.repeat(64);
    const entry = createLedgerEntry(action, basis, valueIds, prevHash);

    set((state) => ({
      ledger: [...state.ledger, entry],
      finCoinBalance: state.finCoinBalance + entry.amount,
      lastAward: { action, amount: entry.amount, basis },
    }));

    return { ok: true, amount: entry.amount };
  },

  completeModule: async (moduleId, performance = 0.8) => {
    const { modules, mode, user, completedModules } = get();
    const module = modules.find((item) => item.id === moduleId);
    if (!module) return { ok: false, reason: 'Модуль не найден.' };

    if (completedModules.includes(moduleId)) {
      return { ok: false, reason: 'Этот модуль уже пройден.' };
    }

    if (mode === 'server') {
      try {
        const response = await api.post<CompleteModuleResponse>(
          `/api/modules/${moduleId}/complete/`,
          { performance },
        );
        await get().refresh();
        return {
          ok: response.ok,
          amount: response.amount,
          reason: response.reason,
        };
      } catch (error) {
        if (error instanceof ApiError) return { ok: false, reason: error.message };
        return { ok: false, reason: 'Сервер недоступен. Попробуйте ещё раз.' };
      }
    }

    const updatedTwin = updateTwinAfterModule(user, module, performance);
    set({ user: updatedTwin, completedModules: [...completedModules, moduleId] });

    return get().award(
      'ai_training_data',
      `Микромодуль «${module.title}»: ошибки помогли улучшить ИИ-тьютора`,
      module.valueTags,
    );
  },

  applyToTask: async (taskId) => {
    set((state) => ({
      appliedTaskIds: state.appliedTaskIds.includes(taskId)
        ? state.appliedTaskIds
        : [...state.appliedTaskIds, taskId],
    }));

    if (get().mode === 'server') {
      try {
        await api.post(`/api/tasks/${taskId}/apply/`, {});
      } catch {
        /* отклик остаётся в локальном состоянии демо */
      }
    }
  },

  skipTask: (taskId) =>
    set((state) => ({
      skippedTaskIds: state.skippedTaskIds.includes(taskId)
        ? state.skippedTaskIds
        : [...state.skippedTaskIds, taskId],
    })),

  resetDemo: async () => {
    if (get().mode === 'server') {
      try {
        await api.post('/api/demo/reset/', {});
        await get().refresh();
        set({ onboardingCompleted: true, skippedTaskIds: [], userRole: 'student' });
        return;
      } catch {
        /* падаем в локальный сброс ниже */
      }
    }

    const ledger = buildStarterLedger();
    set({
      user: mockStudent,
      finCoinBalance: ledger.reduce((sum, entry) => sum + entry.amount, 0),
      ledger,
      availableTasks: mockTasks,
      appliedTaskIds: [],
      skippedTaskIds: [],
      modules: mockMicromodules,
      barriers: mockBarriers,
      serverValues: null,
      serverRules: null,
      completedModules: [...mockStudent.completedModules],
      onboardingCompleted: true,
      userRole: 'student',
      lastAward: null,
      ethicsLog: buildStarterEthicsLog(),
    });
  },
}));

export { COIN_AMOUNTS };
