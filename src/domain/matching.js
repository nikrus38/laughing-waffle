/**
 * Алгоритм матча студента и задачи партнера
 *
 * Итоговый балл от 0 до 100:
 * 100 × (0,40 × skillFit + 0,30 × growthFit + 0,20 × interestFit + 0,10 × loadFit)
 */
export function calculateMatch(student, task) {
    // 1. Skill Fit: взвешенное покрытие требований задачи
    const skillFitFactors = calculateSkillFit(student, task);
    const skillFit = skillFitFactors.reduce((sum, factor) => sum + factor.value * factor.weight, 0);
    // 2. Growth Fit: зона ближайшего развития
    const growthFit = calculateGrowthFit(student, task);
    // 3. Interest Fit: коэффициент Жаккара между интересами и тегами задачи
    const interestFit = calculateInterestFit(student, task);
    // 4. Load Fit: насколько срок задачи помещается в еженедельные свободные часы
    const loadFit = calculateLoadFit(student, task);
    // Итоговый расчет
    const score = Math.round(100 * (0.40 * skillFit +
        0.30 * growthFit +
        0.20 * interestFit +
        0.10 * loadFit));
    // Определяем, является ли задача "на вырост"
    const isStretch = isStretchTask(student, task);
    // Формируем объяснение
    const explanation = generateExplanation({
        skillFit,
        growthFit,
        interestFit,
        loadFit,
        isStretch
    });
    return {
        taskId: task.id,
        score: Math.min(100, Math.max(0, score)), // Ограничиваем 0-100
        factors: [
            { label: 'Соответствие навыкам', weight: 0.40, value: skillFit },
            { label: 'Зона развития', weight: 0.30, value: growthFit },
            { label: 'Соответствие интересам', weight: 0.20, value: interestFit },
            { label: 'Загрузка', weight: 0.10, value: loadFit }
        ],
        isStretch,
        explanation
    };
}
function calculateSkillFit(student, task) {
    const factors = [];
    for (const [competencyId, requiredLevel] of Object.entries(task.required)) {
        const studentLevel = student.competencies[competencyId]?.level || 0;
        const fit = Math.min(studentLevel / requiredLevel, 1);
        factors.push({
            competency: competencyId,
            required: requiredLevel,
            current: studentLevel,
            fit: fit
        });
    }
    return factors.map(f => ({
        label: `Навык: ${f.competency}`,
        weight: 1 / factors.length, // Равные веса для простоты
        value: f.fit
    }));
}
function calculateGrowthFit(student, task) {
    let growthCount = 0;
    let totalCount = 0;
    for (const [competencyId, requiredLevel] of Object.entries(task.required)) {
        const studentLevel = student.competencies[competencyId]?.level || 0;
        const gap = requiredLevel - studentLevel;
        // Зона ближайшего развития: разрыв 5-25 пунктов
        if (gap >= 5 && gap <= 25) {
            growthCount++;
        }
        totalCount++;
    }
    return totalCount > 0 ? growthCount / totalCount : 0;
}
function calculateInterestFit(student, task) {
    // Коэффициент Жаккара между интересами студента и тегами задачи
    const studentInterests = new Set(student.interests);
    const taskTags = new Set(task.tags);
    const intersection = [...studentInterests].filter(interest => taskTags.has(interest)).length;
    const union = new Set([...studentInterests, ...taskTags]).size;
    return union > 0 ? intersection / union : 0;
}
function calculateLoadFit(student, task) {
    // Проверяем, помещается ли задача в еженедельные свободные часы студента
    const hoursPerWeek = student.weeklyHours;
    const hoursNeeded = task.weeks > 0 ? 40 / task.weeks : 0; // Пример: 40 часов на неделю
    if (hoursPerWeek <= 0)
        return 0;
    // Нормализуем значение (чем ближе к 1, тем лучше)
    return Math.min(1, hoursPerWeek / (hoursPerWeek + hoursNeeded));
}
function isStretchTask(student, task) {
    // Задача считается "на вырост", если хотя бы по одной компетенции разрыв большой
    for (const [competencyId, requiredLevel] of Object.entries(task.required)) {
        const studentLevel = student.competencies[competencyId]?.level || 0;
        const gap = requiredLevel - studentLevel;
        // Если разрыв больше 25 пунктов, это задача на вырост
        if (gap > 25) {
            return true;
        }
    }
    return false;
}
function generateExplanation(factors) {
    const explanations = [];
    if (factors.skillFit >= 0.7) {
        explanations.push('Высокое соответствие профессиональным навыкам');
    }
    else if (factors.skillFit <= 0.3) {
        explanations.push('Низкое соответствие профессиональным навыкам');
    }
    else {
        explanations.push('Среднее соответствие профессиональным навыкам');
    }
    if (factors.growthFit >= 0.7) {
        explanations.push('Хорошая зона ближайшего развития');
    }
    else if (factors.growthFit <= 0.3) {
        explanations.push('Малая зона развития');
    }
    if (factors.interestFit >= 0.7) {
        explanations.push('Соответствует вашим интересам');
    }
    else if (factors.interestFit <= 0.3) {
        explanations.push('Не соответствует вашим интересам');
    }
    if (factors.isStretch) {
        explanations.push('Задача на вырост - вызов для развития');
    }
    return explanations.join('; ');
}
