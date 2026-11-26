import {
  Barrier,
  EthicsDecision,
  FinCoinAction,
  LedgerEntry,
  MatchResult,
  Micromodule,
  PartnerTask,
  StudentTwin,
} from '../../domain/types';

/** Форма ответа GET /api/bootstrap/ (серверный режим). */
export interface BootstrapPayload {
  user: {
    id: number;
    username: string;
    displayName: string;
    initials: string;
    course: 1 | 2 | 3 | 4;
    role: 'student' | 'partner';
  };
  balance: number;
  twin: {
    competencies: StudentTwin['competencies'];
    interests: string[];
    weeklyHours: number;
    completedModules: string[];
  };
  tasks: Array<PartnerTask & { match: MatchResult }>;
  appliedTaskIds: string[];
  modules: Micromodule[];
  ledger: LedgerEntry[];
  ethicsLog: EthicsDecision[];
  values: Array<{ id: string; name: string; text: string | null }>;
  ethicsRules: Array<{
    id: string;
    valueId: string;
    module: string;
    title: string;
    algorithm: string;
    without: string;
    with: string;
  }>;
  barriers: Barrier[];
  coinAmounts: Record<FinCoinAction, number>;
  mode: 'server';
}

export interface AwardResponse {
  ok: boolean;
  amount?: number;
  reason?: string;
  balance?: number;
  entry?: LedgerEntry;
}

export interface CompleteModuleResponse extends AwardResponse {
  twin?: BootstrapPayload['twin'];
  changes?: Array<{ competency: string; before: number; after: number }>;
}
