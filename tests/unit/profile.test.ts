import { describe, expect, it } from 'vitest';
import {
  addInterest,
  clampHours,
  initialsOf,
  isDraftDirty,
  normalizeInterest,
  normalizeName,
  removeInterest,
  validateName,
  type ProfileDraft,
} from '../../src/domain/profile';

const base: ProfileDraft = {
  displayName: 'Александр Петров',
  course: 1,
  interests: ['финтех'],
  weeklyHours: 12,
};

describe('Profile rules', () => {
  it('схлопывает пробелы в имени', () => {
    expect(normalizeName('  Александр   Петров ')).toBe('Александр Петров');
  });

  it('проверяет длину имени', () => {
    expect(validateName('А')).toBeTruthy();
    expect(validateName('Александр')).toBeNull();
    expect(validateName('я'.repeat(61))).toBeTruthy();
  });

  it('чистит решётку и пробелы в интересе', () => {
    expect(normalizeInterest('##  Финтех  ')).toBe('Финтех');
  });

  it('не добавляет дубль интереса без учёта регистра', () => {
    const result = addInterest(['Финтех'], 'финтех');
    expect(result.list).toEqual(['Финтех']);
    expect(result.error).toContain('уже есть');
  });

  it('ограничивает количество интересов', () => {
    const full = Array.from({ length: 8 }, (_, index) => `тема-${index}`);
    const result = addInterest(full, 'девятая');
    expect(result.list).toHaveLength(8);
    expect(result.error).toContain('не больше 8');
  });

  it('удаляет интерес по значению', () => {
    expect(removeInterest(['финтех', 'данные'], 'финтех')).toEqual(['данные']);
  });

  it('зажимает часы в границы', () => {
    expect(clampHours(1)).toBe(4);
    expect(clampHours(99)).toBe(30);
    expect(clampHours(Number.NaN)).toBe(4);
    expect(clampHours(12.4)).toBe(12);
  });

  it('считает инициалы', () => {
    expect(initialsOf('Александр Петров')).toBe('АП');
    expect(initialsOf('Пётр')).toBe('П');
    expect(initialsOf('   ')).toBe('ФТ');
  });

  it('видит изменения черновика', () => {
    expect(isDraftDirty(base, base)).toBe(false);
    expect(isDraftDirty({ ...base, course: 2 }, base)).toBe(true);
    expect(
      isDraftDirty({ ...base, interests: ['финтех', 'данные'] }, base),
    ).toBe(true);
  });
});
