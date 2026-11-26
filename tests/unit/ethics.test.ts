import { describe, it, expect } from 'vitest';
import {
  applyEthicsFilter,
  createEthicsDecision,
  ensureStretchInTop3,
} from '../../src/domain/ethics';

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
    const decision = createEthicsDecision(
      'matcher',
      'MATCH-001',
      'Test decision',
      [{ id: 'item-1', label: 'Item 1' }],
      [{ id: 'rejected-1', reason: 'Test reason', valueId: 'value-1' }],
      'item-1',
      ['value-1']
    );
    
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

  it('MATCH-001: добавляет задачу на вырост, не дублируя её', () => {
    const matches = [
      { taskId: 'easy-1', title: 'Лёгкая 1', isStretch: false, score: 90 },
      { taskId: 'easy-2', title: 'Лёгкая 2', isStretch: false, score: 80 },
      { taskId: 'easy-3', title: 'Лёгкая 3', isStretch: false, score: 70 },
      { taskId: 'stretch', title: 'На вырост', isStretch: true, score: 40 },
    ];

    const { ordered, decision } = ensureStretchInTop3(matches);

    // Все задачи сохранились ровно по одному разу
    expect(ordered).toHaveLength(matches.length);
    expect(new Set(ordered.map((m) => m.taskId)).size).toBe(matches.length);

    // В первой тройке есть задача на вырост
    expect(ordered.slice(0, 3).some((m) => m.isStretch)).toBe(true);

    // Решение записано с правилом и ценностью
    expect(decision).not.toBeNull();
    expect(decision?.ruleId).toBe('MATCH-001');
    expect(decision?.valueIds).toContain('excellence');
  });

  it('MATCH-001: не меняет порядок, если задача на вырост уже в топ-3', () => {
    const matches = [
      { taskId: 'a', title: 'A', isStretch: true, score: 90 },
      { taskId: 'b', title: 'B', isStretch: false, score: 80 },
      { taskId: 'c', title: 'C', isStretch: false, score: 70 },
    ];

    const { ordered, decision } = ensureStretchInTop3(matches);

    expect(ordered.map((m) => m.taskId)).toEqual(['a', 'b', 'c']);
    expect(decision).toBeNull();
  });
});