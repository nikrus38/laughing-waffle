import { StudentTwin, PartnerTask, MatchResult } from './types';
/**
 * Алгоритм матча студента и задачи партнера
 *
 * Итоговый балл от 0 до 100:
 * 100 × (0,40 × skillFit + 0,30 × growthFit + 0,20 × interestFit + 0,10 × loadFit)
 */
export declare function calculateMatch(student: StudentTwin, task: PartnerTask): MatchResult;
//# sourceMappingURL=matching.d.ts.map