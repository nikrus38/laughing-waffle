import { EthicsDecision } from './types';
/**
 * Этический фильтр (policy engine)
 */
export interface EthicsRule {
    id: string;
    valueId: string;
    module: string;
    title: string;
    description: string;
    check: (context: any) => EthicsDecision | null;
}
export declare const ethicsRules: EthicsRule[];
/**
 * Применение этического фильтра к кандидатам
 */
export declare function applyEthicsFilter(candidates: any[], context: any): {
    filtered: any[];
    decisions: EthicsDecision[];
};
/**
 * Создание записи этического решения
 */
export declare function createEthicsDecision(module: string, ruleId: string, summary: string, considered: {
    id: string;
    label: string;
}[], rejected: {
    id: string;
    reason: string;
    valueId: string;
}[], chosen: string, valueIds: string[]): EthicsDecision;
//# sourceMappingURL=ethics.d.ts.map