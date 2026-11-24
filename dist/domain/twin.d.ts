import { StudentTwin, Micromodule, CompetencyId } from './types';
/**
 * Обновление цифрового двойника после прохождения микромодуля
 *
 * Формула: level_c += gain_c × (1 − level_c / 100) × performance
 * где performance — доля верных ответов (убывающая отдача)
 */
export declare function updateTwinAfterModule(twin: StudentTwin, module: Micromodule, performance?: number): StudentTwin;
/**
 * Определение зоны ближайшего развития
 * Компетенции, где target − level от 10 до 35
 */
export declare function getDevelopmentZone(twin: StudentTwin): CompetencyId[];
/**
 * Рейтинг микромодуля для рекомендации
 * Сумма приростов по осям из зоны развития, делённая на минуты
 */
export declare function rateModuleForRecommendation(twin: StudentTwin, module: Micromodule): number;
/**
 * Проверка правила TWIN-001: не более двух подряд модулей сложности 1-2
 */
export declare function checkConsecutiveEasyModules(completedModules: string[], newModule: Micromodule, modules: Micromodule[]): boolean;
//# sourceMappingURL=twin.d.ts.map