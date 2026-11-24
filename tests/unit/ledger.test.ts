import { describe, it, expect } from 'vitest';
import { 
  createLedgerEntry, 
  calculateEntryHash, 
  verifyChain, 
  checkDailyLimits, 
  checkUniqueBasis,
  COIN_AMOUNTS,
  DAILY_LIMITS
} from '../../src/domain/ledger';

describe('FinCoin Ledger Functions', () => {
  it('should create ledger entry with correct amounts', () => {
    const entry = createLedgerEntry('ai_training_data', 'Test basis', ['value1']);
    
    // Проверяем правильную сумму
    expect(entry.amount).toBe(COIN_AMOUNTS['ai_training_data']);
    expect(entry.amount).toBe(20);
    
    // Проверяем структуру записи
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('ts');
    expect(entry).toHaveProperty('action', 'ai_training_data');
    expect(entry).toHaveProperty('basis', 'Test basis');
    expect(entry).toHaveProperty('valueIds', ['value1']);
    expect(entry).toHaveProperty('prevHash');
    expect(entry).toHaveProperty('hash');
  });

  it('should calculate entry hash', () => {
    const entry = createLedgerEntry('data_challenge', 'Test basis', ['value1']);
    
    // Хэш должен быть строкой длиной 64 символа
    expect(typeof entry.hash).toBe('string');
    expect(entry.hash).toHaveLength(64);
  });

  it('should verify chain integrity', () => {
    const entry1 = createLedgerEntry('ai_training_data', 'Basis 1', ['value1']);
    const entry2 = createLedgerEntry('data_challenge', 'Basis 2', ['value2'], entry1.hash);
    
    // Цепочка должна быть валидной
    const result = verifyChain([entry1, entry2]);
    expect(result.valid).toBe(true);
  });

  it('should detect broken chain', () => {
    const entry1 = createLedgerEntry('ai_training_data', 'Basis 1', ['value1']);
    const entry2 = createLedgerEntry('data_challenge', 'Basis 2', ['value2']); // Неправильный prevHash
    
    // Цепочка должна быть невалидной
    const result = verifyChain([entry1, entry2]);
    expect(result.valid).toBe(false);
  });

  it('should check daily limits', () => {
    const now = Date.now();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Создаем записи для проверки лимитов
    const entries = [
      createLedgerEntry('ai_training_data', 'Basis 1', ['value1'], '0'.repeat(64)),
      createLedgerEntry('ai_training_data', 'Basis 2', ['value2'], '0'.repeat(64))
    ];
    
    // Проверяем лимит (3 для ai_training_data)
    const withinLimit = checkDailyLimits(entries, 'ai_training_data', now);
    expect(withinLimit).toBe(true);
    
    // Добавляем еще одну запись, чтобы превысить лимит
    entries.push(createLedgerEntry('ai_training_data', 'Basis 3', ['value3'], '0'.repeat(64)));
    const exceedsLimit = checkDailyLimits(entries, 'ai_training_data', now);
    expect(exceedsLimit).toBe(false);
  });

  it('should check unique basis', () => {
    const entries = [
      createLedgerEntry('ai_training_data', 'Unique basis 1', ['value1']),
      createLedgerEntry('data_challenge', 'Unique basis 2', ['value2'])
    ];
    
    // Уникальное основание должно пройти проверку
    const isUnique = checkUniqueBasis(entries, 'Unique basis 3');
    expect(isUnique).toBe(true);
    
    // Неуникальное основание не должно пройти проверку
    const isNotUnique = checkUniqueBasis(entries, 'Unique basis 1');
    expect(isNotUnique).toBe(false);
  });
});