// Скрипт для проверки целостности моковых данных
import { mockBarriers } from './barriers';
import { mockStudent } from './students';
import { mockTasks } from './tasks';
import { mockMicromodules } from './modules';
import { mockValues } from './values';
export function checkDataIntegrity() {
    const errors = [];
    // Проверка барьеров
    mockBarriers.forEach(barrier => {
        if (!barrier.id || !barrier.title) {
            errors.push(`Barrier ${barrier.id} has missing required fields`);
        }
        if (barrier.severity < 0 || barrier.severity > 3) {
            errors.push(`Barrier ${barrier.id} has invalid severity: ${barrier.severity}`);
        }
    });
    // Проверка студента
    if (!mockStudent.id || !mockStudent.displayName) {
        errors.push('Student missing required fields');
    }
    // Проверка компетенций студента
    Object.entries(mockStudent.competencies).forEach(([compId, comp]) => {
        if (comp.level < 0 || comp.level > 100) {
            errors.push(`Student competency ${compId} has invalid level: ${comp.level}`);
        }
        if (comp.target < 0 || comp.target > 100) {
            errors.push(`Student competency ${compId} has invalid target: ${comp.target}`);
        }
    });
    // Проверка задач
    mockTasks.forEach(task => {
        if (!task.id || !task.title) {
            errors.push(`Task ${task.id} has missing required fields`);
        }
        if (task.difficulty < 1 || task.difficulty > 5) {
            errors.push(`Task ${task.id} has invalid difficulty: ${task.difficulty}`);
        }
    });
    // Проверка микромодулей
    mockMicromodules.forEach(module => {
        if (!module.id || !module.title) {
            errors.push(`Module ${module.id} has missing required fields`);
        }
        if (module.difficulty < 1 || module.difficulty > 5) {
            errors.push(`Module ${module.id} has invalid difficulty: ${module.difficulty}`);
        }
        if (module.minutes <= 0) {
            errors.push(`Module ${module.id} has invalid minutes: ${module.minutes}`);
        }
    });
    // Проверка ценностей
    mockValues.forEach(value => {
        if (!value.id || !value.name) {
            errors.push(`Value ${value.id} has missing required fields`);
        }
    });
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Выполняем проверку при импорте
const result = checkDataIntegrity();
if (!result.isValid) {
    console.warn('Data integrity check failed:', result.errors);
}
