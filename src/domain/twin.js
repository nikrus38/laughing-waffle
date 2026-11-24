/**
 * Обновление цифрового двойника после прохождения микромодуля
 *
 * Формула: level_c += gain_c × (1 − level_c / 100) × performance
 * где performance — доля верных ответов (убывающая отдача)
 */
export function updateTwinAfterModule(twin, module, performance = 1.0) {
    // Создаем копию двойника для обновления
    const updatedTwin = JSON.parse(JSON.stringify(twin));
    // Обновляем каждую компетенцию, которую развивает модуль
    for (const [competencyId, gain] of Object.entries(module.gains)) {
        const compId = competencyId;
        const currentLevel = updatedTwin.competencies[compId]?.level || 0;
        // Применяем формулу с убывающей отдачей
        const levelGain = gain * (1 - currentLevel / 100) * performance;
        const newLevel = Math.min(100, currentLevel + levelGain);
        if (updatedTwin.competencies[compId]) {
            updatedTwin.competencies[compId].level = newLevel;
        }
    }
    // Добавляем модуль в список пройденных
    if (!updatedTwin.completedModules.includes(module.id)) {
        updatedTwin.completedModules.push(module.id);
    }
    return updatedTwin;
}
/**
 * Определение зоны ближайшего развития
 * Компетенции, где target − level от 10 до 35
 */
export function getDevelopmentZone(twin) {
    const developmentZone = [];
    for (const [compId, competency] of Object.entries(twin.competencies)) {
        const gap = competency.target - competency.level;
        if (gap >= 10 && gap <= 35) {
            developmentZone.push(compId);
        }
    }
    return developmentZone;
}
/**
 * Рейтинг микромодуля для рекомендации
 * Сумма приростов по осям из зоны развития, делённая на минуты
 */
export function rateModuleForRecommendation(twin, module) {
    const developmentZone = getDevelopmentZone(twin);
    let totalGain = 0;
    // Считаем прирост только по компетенциям из зоны развития
    for (const compId of developmentZone) {
        if (module.gains[compId]) {
            totalGain += module.gains[compId];
        }
    }
    // Делим на длительность модуля (в минутах) для нормализации
    return module.minutes > 0 ? totalGain / module.minutes : 0;
}
/**
 * Проверка правила TWIN-001: не более двух подряд модулей сложности 1-2
 */
export function checkConsecutiveEasyModules(completedModules, newModule, modules) {
    // Если новый модуль сложности 1-2
    if (newModule.difficulty <= 2) {
        // Проверяем последние 2 пройденных модуля
        const recentModules = completedModules.slice(-2);
        for (const moduleId of recentModules) {
            const module = modules.find(m => m.id === moduleId);
            if (module && module.difficulty <= 2) {
                // Найден еще один легкий модуль подряд
                return false; // Не рекомендуем
            }
        }
    }
    return true; // Можно рекомендовать
}
