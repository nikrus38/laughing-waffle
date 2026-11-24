import { describe, it, expect } from 'vitest';
import { applyEthicsFilter, createEthicsDecision } from '../../src/domain/ethics';
describe('Ethics Filter Functions', () => {
    it('should apply ethics filter to candidates', () => {
        const candidates = [{ id: 'candidate-1' }, { id: 'candidate-2' }];
        const context = { test: 'context' };
        const result = applyEthicsFilter(candidates, context);
        // Проверяем структуру результата
        expect(result).toHaveProperty('filtered');
        expect(result).toHaveProperty('decisions');
        expect(Array.isArray(result.decisions)).toBe(true);
    });
    it('should create ethics decision record', () => {
        const decision = createEthicsDecision('matcher', 'MATCH-001', 'Test decision', [{ id: 'item-1', label: 'Item 1' }], [{ id: 'rejected-1', reason: 'Test reason', valueId: 'value-1' }], 'item-1', ['value-1']);
        // Проверяем структуру записи
        expect(decision).toHaveProperty('id');
        expect(decision).toHaveProperty('ts');
        expect(decision).toHaveProperty('module', 'matcher');
        expect(decision).toHaveProperty('ruleId', 'MATCH-001');
        expect(decision).toHaveProperty('summary', 'Test decision');
        expect(decision).toHaveProperty('considered');
        expect(decision).toHaveProperty('rejected');
        expect(decision).toHaveProperty('chosen', 'item-1');
        expect(decision).toHaveProperty('valueIds', ['value-1']);
    });
    it('should include timestamp in decision records', () => {
        const before = Date.now();
        const decision = createEthicsDecision('matcher', 'TEST-001', 'Test', [], [], '', []);
        const after = Date.now();
        // Временная метка должна быть в правильном диапазоне
        expect(decision.ts).toBeGreaterThanOrEqual(before);
        expect(decision.ts).toBeLessThanOrEqual(after);
    });
    it('should generate unique IDs for decisions', () => {
        const decision1 = createEthicsDecision('matcher', 'TEST-001', 'Test', [], [], '', []);
        const decision2 = createEthicsDecision('matcher', 'TEST-001', 'Test', [], [], '', []);
        // ID должны быть уникальными
        expect(decision1.id).not.toBe(decision2.id);
    });
});
//# sourceMappingURL=ethics.test.js.map