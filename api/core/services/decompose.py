"""Декомпозиция задачи партнёра в учебные кейсы.

Детерминированный генератор по тегам: никаких внешних моделей.
Готовые примеры лежат в PRESETS, остальное собирается по правилам.
"""
from __future__ import annotations

PRESETS: list[dict] = [
    {
        "code": "churn",
        "label": "Прогноз оттока клиентов",
        "partner": "Крупный банк (пример)",
        "tags": ["аналитика данных", "машинное обучение", "финансы"],
        "cases": [
            {"title": "Собрать и очистить исторические данные", "course": 1, "competency": "data", "coins": 20},
            {"title": "Описательная статистика и гипотезы", "course": 1, "competency": "research", "coins": 20},
            {"title": "Логистическая регрессия и валидация", "course": 3, "competency": "ai", "coins": 100},
            {"title": "Перевести модель на язык бизнеса", "course": 3, "competency": "finance", "coins": 50},
            {"title": "Пилот у партнёра и сбор обратной связи", "course": 4, "competency": "entre", "coins": 100},
        ],
    },
    {
        "code": "chatbot",
        "label": "Чат-бот консультаций",
        "partner": "Финтех-компания (пример)",
        "tags": ["искусственный интеллект", "чат-бот", "автоматизация"],
        "cases": [
            {"title": "Разметить частые вопросы клиентов", "course": 1, "competency": "comm", "coins": 20},
            {"title": "Собрать прототип на готовом API", "course": 2, "competency": "code", "coins": 50},
            {"title": "Оценить качество ответов", "course": 3, "competency": "ai", "coins": 50},
            {"title": "Подготовить сценарии эскалации оператору", "course": 3, "competency": "comm", "coins": 20},
            {"title": "Запустить пилот и посчитать эффект", "course": 4, "competency": "entre", "coins": 100},
        ],
    },
    {
        "code": "security",
        "label": "Аудит безопасности учебного стенда",
        "partner": "ИТ-департамент (пример)",
        "tags": ["кибербезопасность", "тестирование", "интерфейсы"],
        "cases": [
            {"title": "Инвентаризация сервисов и доступов", "course": 1, "competency": "data", "coins": 20},
            {"title": "Поиск типовых уязвимостей", "course": 2, "competency": "code", "coins": 50},
            {"title": "Отчёт и приоритизация рисков", "course": 3, "competency": "research", "coins": 50},
            {"title": "Исправление и повторная проверка", "course": 3, "competency": "code", "coins": 50},
            {"title": "Регламент для младших курсов", "course": 4, "competency": "lead", "coins": 50},
        ],
    },
]

TAG_RULES = [
    ({"искусственный интеллект", "машинное обучение", "антифрод"}, "ai",
     "Собрать и оценить модель на открытых данных", "Разобрать ограничения и риски модели"),
    ({"финансы", "инвестиции", "налоги", "финансовые технологии"}, "finance",
     "Перевести задачу в финансовые показатели", "Посчитать эффект для партнёра"),
    ({"кибербезопасность", "тестирование"}, "code",
     "Проверить систему по чек-листу уязвимостей", "Написать автотест на найденный дефект"),
    ({"визуализация", "отчетность", "интерфейсы", "доступность"}, "comm",
     "Собрать прототип экрана или дашборда", "Проверить доступность и понятность"),
]


def find_preset(code: str | None = None, title: str | None = None) -> dict | None:
    if code:
        preset = next((item for item in PRESETS if item["code"] == code), None)
        if preset:
            return preset
    if title:
        lowered = title.lower()
        for preset in PRESETS:
            if preset["label"].lower() == lowered:
                return preset
    return None


def decompose(title: str, tags: list[str] | None = None, partner: str = "Партнёр (пример)") -> dict:
    """Возвращает задачу и 4–6 учебных кейсов по курсам."""
    preset = find_preset(title=title)
    if preset:
        cases = preset["cases"]
        return {
            "title": preset["label"],
            "partner": preset["partner"],
            "cases": cases,
            "totalCoins": sum(case["coins"] for case in cases),
            "source": "preset",
        }

    tags = [tag.strip().lower() for tag in (tags or [])]
    matched = None
    for tag_set, competency, case_one, case_two in TAG_RULES:
        if tag_set & set(tags):
            matched = (competency, case_one, case_two)
            break

    competency, case_one, case_two = matched or (
        "research",
        "Разобрать постановку задачи и данные",
        "Собрать прототип решения",
    )

    cases = [
        {"title": f"{title}: разобрать постановку и данные", "course": 1, "competency": "data", "coins": 20},
        {"title": case_one, "course": 2, "competency": competency, "coins": 50},
        {"title": case_two, "course": 3, "competency": competency, "coins": 50},
        {"title": "Оформить результат и защитить перед партнёром", "course": 4, "competency": "comm", "coins": 100},
    ]
    return {
        "title": title,
        "partner": partner,
        "cases": cases,
        "totalCoins": sum(case["coins"] for case in cases),
        "source": "generated",
    }
