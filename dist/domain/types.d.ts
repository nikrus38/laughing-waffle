export type CompetencyId = 'data' | 'code' | 'finance' | 'comm' | 'research' | 'entre' | 'ai' | 'lead';
export type ValueId = string;
export interface StudentTwin {
    id: string;
    displayName: string;
    course: 1 | 2 | 3 | 4;
    competencies: Record<CompetencyId, {
        level: number;
        target: number;
    }>;
    interests: string[];
    completedModules: string[];
    weeklyHours: number;
    isMock: true;
}
export interface Micromodule {
    id: string;
    title: string;
    minutes: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    kind: 'learn' | 'practice' | 'mentor';
    gains: Partial<Record<CompetencyId, number>>;
    valueTags: ValueId[];
}
export interface PartnerTask {
    id: string;
    title: string;
    partnerLabel: string;
    summary: string;
    required: Partial<Record<CompetencyId, number>>;
    difficulty: 1 | 2 | 3 | 4 | 5;
    weeks: number;
    tags: string[];
    isMock: true;
}
export interface MatchResult {
    taskId: string;
    score: number;
    factors: {
        label: string;
        weight: number;
        value: number;
    }[];
    isStretch: boolean;
    explanation: string;
}
export type FinCoinAction = 'ai_training_data' | 'data_challenge' | 'mentoring' | 'anomaly_report' | 'market_value' | 'knowledge_export';
export interface LedgerEntry {
    id: string;
    ts: number;
    action: FinCoinAction;
    amount: number;
    basis: string;
    valueIds: ValueId[];
    prevHash: string;
    hash: string;
}
export interface EthicsDecision {
    id: string;
    ts: number;
    module: 'matcher' | 'twin' | 'wallet' | 'decomposer' | 'patents';
    ruleId: string;
    summary: string;
    considered: {
        id: string;
        label: string;
    }[];
    rejected: {
        id: string;
        reason: string;
        valueId: ValueId;
    }[];
    chosen: string;
    valueIds: ValueId[];
}
export interface Barrier {
    id: string;
    category: 'administrative' | 'informational' | 'cultural';
    title: string;
    stage: 'search' | 'agreement' | 'launch' | 'evaluation' | 'scale';
    severity: 0 | 1 | 2 | 3;
    solvedBy: string;
    note: string;
}
//# sourceMappingURL=types.d.ts.map