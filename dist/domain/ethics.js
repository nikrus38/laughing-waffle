// Примеры правил (заглушки)
export const ethicsRules = [
    {
        id: 'MATCH-001',
        valueId: 'excellence',
        module: 'matcher',
        title: 'Минимум одна задача на вырост',
        description: 'В первой тройке рекомендаций минимум одна задача на вырост',
        check: (context) => {
            // В реальной реализации здесь была бы логика проверки
            return null; // Заглушка
        }
    },
    {
        id: 'WALLET-001',
        valueId: 'integrity',
        module: 'wallet',
        title: 'Приоритет духовного над материальным',
        description: 'FinCoin не может быть единственным основанием рекомендации',
        check: (context) => {
            return null; // Заглушка
        }
    },
    {
        id: 'LEDGER-001',
        valueId: 'integrity',
        module: 'wallet',
        title: 'Порядочность',
        description: 'Каждая идея и модуль имеют зафиксированного автора',
        check: (context) => {
            return null; // Заглушка
        }
    },
    {
        id: 'EXPORT-001',
        valueId: 'patriotism',
        module: 'wallet',
        title: 'Патриотизм',
        description: 'Действие "экспорт знаний" поощряет открытые модули по истории российской финансовой инженерии',
        check: (context) => {
            return null; // Заглушка
        }
    },
    {
        id: 'TWIN-001',
        valueId: 'personality',
        module: 'twin',
        title: 'Личность',
        description: 'Двойник показывает рост и сильные стороны, а не рейтинг',
        check: (context) => {
            return null; // Заглушка
        }
    }
];
/**
 * Применение этического фильтра к кандидатам
 */
export function applyEthicsFilter(candidates, context) {
    const decisions = [];
    let filteredCandidates = [...candidates];
    // Применяем правила по порядку
    for (const rule of ethicsRules) {
        // В реальной реализации здесь была бы логика применения правил
        // Для демо просто создаем запись о применении правила
        const decision = {
            id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ts: Date.now(),
            module: rule.module,
            ruleId: rule.id,
            summary: `Применено правило: ${rule.title}`,
            considered: [],
            rejected: [],
            chosen: '',
            valueIds: [rule.valueId]
        };
        decisions.push(decision);
    }
    return {
        filtered: filteredCandidates,
        decisions
    };
}
/**
 * Создание записи этического решения
 */
export function createEthicsDecision(module, ruleId, summary, considered, rejected, chosen, valueIds) {
    return {
        id: `ethics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ts: Date.now(),
        module: module,
        ruleId,
        summary,
        considered,
        rejected,
        chosen,
        valueIds
    };
}
//# sourceMappingURL=ethics.js.map