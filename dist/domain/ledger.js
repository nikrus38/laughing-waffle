/**
 * Реестр FinCoin с цепочкой хэшей
 */
// Дневные лимиты на тип действия
export const DAILY_LIMITS = {
    'ai_training_data': 3,
    'data_challenge': 1,
    'mentoring': 2,
    'anomaly_report': 2,
    'market_value': 1,
    'knowledge_export': 1
};
// Суммы начислений
export const COIN_AMOUNTS = {
    'ai_training_data': 20,
    'data_challenge': 100,
    'mentoring': 50,
    'anomaly_report': 40,
    'market_value': 150,
    'knowledge_export': 70
};
/**
 * Создание новой записи в реестре
 */
export function createLedgerEntry(action, basis, valueIds, prevHash = '0'.repeat(64) // Начальный хэш
) {
    const entry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ts: Date.now(),
        action,
        amount: COIN_AMOUNTS[action],
        basis,
        valueIds,
        prevHash,
        hash: '' // Будет рассчитан позже
    };
    // Рассчитываем хэш записи
    entry.hash = calculateEntryHash(entry);
    return entry;
}
/**
 * Расчет хэша для записи
 */
export function calculateEntryHash(entry) {
    const data = `${entry.prevHash}|${entry.id}|${entry.ts}|${entry.action}|${entry.amount}|${entry.basis}`;
    // В реальной реализации здесь был бы SHA-256
    // Для демо используем простую хэш-функцию
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Преобразуем в 32-bit целое
    }
    // Преобразуем в 64-символьную строку
    return Math.abs(hash).toString(16).padStart(16, '0').repeat(4);
}
/**
 * Проверка целостности цепочки
 */
export function verifyChain(entries) {
    if (entries.length === 0)
        return { valid: true };
    // Проверяем начальный хэш
    if (entries[0].prevHash !== '0'.repeat(64)) {
        return { valid: false, brokenAt: 0 };
    }
    // Проверяем каждую запись
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const expectedHash = calculateEntryHash(entry);
        if (entry.hash !== expectedHash) {
            return { valid: false, brokenAt: i };
        }
        // Проверяем связь с предыдущей записью
        if (i > 0 && entry.prevHash !== entries[i - 1].hash) {
            return { valid: false, brokenAt: i };
        }
    }
    return { valid: true };
}
/**
 * Проверка дневных лимитов
 */
export function checkDailyLimits(entries, action, today = Date.now()) {
    const dailyLimit = DAILY_LIMITS[action];
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const todayEntries = entries.filter(entry => entry.action === action &&
        entry.ts >= startOfDay.getTime() &&
        entry.ts < endOfDay.getTime());
    return todayEntries.length < dailyLimit;
}
/**
 * Проверка уникальности основания
 */
export function checkUniqueBasis(entries, basis) {
    return !entries.some(entry => entry.basis === basis);
}
//# sourceMappingURL=ledger.js.map