// Моковый студент-первокурсник
export const mockStudent = {
    id: 'student-1',
    displayName: 'Александр Петров',
    course: 1,
    competencies: {
        'data': { level: 45, target: 70 },
        'code': { level: 35, target: 65 },
        'finance': { level: 55, target: 80 },
        'comm': { level: 60, target: 75 },
        'research': { level: 40, target: 70 },
        'entre': { level: 30, target: 60 },
        'ai': { level: 25, target: 55 },
        'lead': { level: 50, target: 70 }
    },
    interests: ['аналитика данных', 'искусственный интеллект', 'финансовые технологии'],
    completedModules: ['mm-1', 'mm-2'],
    weeklyHours: 20,
    isMock: true
};
// Моковые наставники
export const mockMentors = [
    {
        id: 'mentor-1',
        displayName: 'Мария Иванова',
        course: 3,
        competencies: {
            'data': { level: 85, target: 90 },
            'code': { level: 80, target: 85 },
            'finance': { level: 75, target: 80 },
            'comm': { level: 80, target: 85 },
            'research': { level: 70, target: 75 },
            'entre': { level: 75, target: 80 },
            'ai': { level: 70, target: 75 },
            'lead': { level: 85, target: 90 }
        },
        interests: ['наставничество', 'аналитика', 'финансовые технологии'],
        completedModules: ['mm-1', 'mm-2', 'mm-3', 'mm-4', 'mm-5'],
        weeklyHours: 15,
        isMock: true
    },
    {
        id: 'mentor-2',
        displayName: 'Дмитрий Смирнов',
        course: 4,
        competencies: {
            'data': { level: 90, target: 95 },
            'code': { level: 85, target: 90 },
            'finance': { level: 80, target: 85 },
            'comm': { level: 75, target: 80 },
            'research': { level: 85, target: 90 },
            'entre': { level: 80, target: 85 },
            'ai': { level: 85, target: 90 },
            'lead': { level: 80, target: 85 }
        },
        interests: ['искусственный интеллект', 'наставничество', 'инновации'],
        completedModules: ['mm-1', 'mm-2', 'mm-3', 'mm-4', 'mm-5', 'mm-6'],
        weeklyHours: 10,
        isMock: true
    },
    {
        id: 'mentor-3',
        displayName: 'Екатерина Волкова',
        course: 2,
        competencies: {
            'data': { level: 70, target: 80 },
            'code': { level: 65, target: 75 },
            'finance': { level: 75, target: 85 },
            'comm': { level: 70, target: 80 },
            'research': { level: 65, target: 75 },
            'entre': { level: 70, target: 80 },
            'ai': { level: 60, target: 70 },
            'lead': { level: 65, target: 75 }
        },
        interests: ['финансовые технологии', 'аналитика', 'наставничество'],
        completedModules: ['mm-1', 'mm-2', 'mm-3', 'mm-4'],
        weeklyHours: 20,
        isMock: true
    }
];
