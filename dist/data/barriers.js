// Моковые данные для барьеров (экспертная оценка команды)
export const mockBarriers = [
    {
        id: 'barrier-1',
        category: 'administrative',
        title: 'Долгое согласование договоров',
        stage: 'agreement',
        severity: 3,
        solvedBy: 'diagnostics',
        note: 'Оценка команды, не результат исследования. Реальное время согласования 2-3 месяца.'
    },
    {
        id: 'barrier-2',
        category: 'informational',
        title: 'Отсутствие единой платформы обмена данными',
        stage: 'search',
        severity: 2,
        solvedBy: 'twin',
        note: 'Оценка команды. Студенты используют до 5 разных систем для одной задачи.'
    },
    {
        id: 'barrier-3',
        category: 'cultural',
        title: 'Недоверие к цифровым решениям',
        stage: 'launch',
        severity: 2,
        solvedBy: 'ethics',
        note: 'Оценка команды. Преподаватели предпочитают традиционные методы.'
    },
    {
        id: 'barrier-4',
        category: 'administrative',
        title: 'Сложности с интеллектуальной собственностью',
        stage: 'scale',
        severity: 3,
        solvedBy: 'patents',
        note: 'Оценка команды. Неясные правила владения результатами НИОКР.'
    },
    {
        id: 'barrier-5',
        category: 'informational',
        title: 'Несовместимость форматов данных',
        stage: 'evaluation',
        severity: 2,
        solvedBy: 'diagnostics',
        note: 'Оценка команды. Разные факультеты используют разные стандарты.'
    },
    {
        id: 'barrier-6',
        category: 'cultural',
        title: 'Сопротивление изменениям',
        stage: 'search',
        severity: 3,
        solvedBy: 'trajectory',
        note: 'Оценка команды. Сложности внедрения новых подходов.'
    }
];
//# sourceMappingURL=barriers.js.map