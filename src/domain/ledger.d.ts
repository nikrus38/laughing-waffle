import { LedgerEntry, FinCoinAction } from './types';
/**
 * Реестр FinCoin с цепочкой хэшей
 */
export declare const DAILY_LIMITS: Record<FinCoinAction, number>;
export declare const COIN_AMOUNTS: Record<FinCoinAction, number>;
/**
 * Создание новой записи в реестре
 */
export declare function createLedgerEntry(action: FinCoinAction, basis: string, valueIds: string[], prevHash?: string): LedgerEntry;
/**
 * Расчет хэша для записи
 */
export declare function calculateEntryHash(entry: LedgerEntry): string;
/**
 * Проверка целостности цепочки
 */
export declare function verifyChain(entries: LedgerEntry[]): {
    valid: boolean;
    brokenAt?: number;
};
/**
 * Проверка дневных лимитов
 */
export declare function checkDailyLimits(entries: LedgerEntry[], action: FinCoinAction, today?: number): boolean;
/**
 * Проверка уникальности основания
 */
export declare function checkUniqueBasis(entries: LedgerEntry[], basis: string): boolean;
