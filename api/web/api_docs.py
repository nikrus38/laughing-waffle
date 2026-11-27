"""Содержание страницы /docs/: навигация и карточки эндпоинтов.

Документация живёт рядом с кодом: если меняется контракт API, правится
этот файл, а страница и её оглавление собираются из него автоматически.
"""
from __future__ import annotations

from textwrap import dedent

BASE_URL = "https://fintwin.duckdns.org"

HERO_STATS = [
    {"value": "18", "label": "эндпоинтов"},
    {"value": "JSON", "label": "формат ответа"},
    {"value": "v1", "label": "версия контракта"},
]

# Порядок действий и суммы зашиты в доменный слой: см. core/services/ledger.py
COIN_ACTIONS = [
    ("ai_training_data", "Генерация данных для обучения ИИ", 20, 3),
    ("data_challenge", "Решение задачи партнёра (Data Challenge)", 100, 1),
    ("mentoring", "Проактивное наставничество", 50, 2),
    ("anomaly_report", "Обнаружение аномалии или уязвимости", 40, 2),
    ("market_value", "Создание рыночной ценности", 150, 1),
    ("knowledge_export", "Экспорт знаний по финансовой инженерии", 70, 1),
]

ERRORS = [
    (
        "400",
        "Некорректный запрос",
        "Не хватает поля, значение вне диапазона или нарушено правило (лимит, дубль основания).",
    ),
    ("403", "Нет доступа", "Запрос без активной сессии или без заголовка X-CSRFToken."),
    ("404", "Не найдено", "Задача или микромодуль с таким кодом отсутствуют."),
    ("429", "Слишком часто", "Превышен дневной лимит начислений по этому типу действия."),
    ("500", "Ошибка сервера", "Исключение на бэкенде. Повторите запрос и посмотрите /status/."),
]

ENDPOINTS = [
    # --- Пользователь ---------------------------------------------------
    {
        "id": "auth-register",
        "group": "user",
        "method": "POST",
        "path": "/api/auth/register/",
        "title": "Регистрация",
        "auth": False,
        "summary": "Создаёт пользователя, цифрового двойника с нулевыми компетенциями и открывает сессию.",
        "body": [
            ("username", "string", "да", "Логин, приводится к нижнему регистру."),
            ("password", "string", "да", "Пароль, проверяется валидаторами Django."),
            ("displayName", "string", "нет", "Отображаемое имя. По умолчанию равно логину."),
            ("course", "integer", "нет", "Курс 1–4. По умолчанию 1."),
        ],
        "request": """{
  "username": "ivan",
  "password": "uchenik2026",
  "displayName": "Иван Соколов",
  "course": 1
}""",
        "response": """HTTP 201 Created
{
  "user": {
    "id": 2,
    "username": "ivan",
    "displayName": "Иван Соколов",
    "initials": "ИС",
    "course": 1,
    "role": "student",
    "isMock": true
  }
}""",
        "errors": [
            ("400", "Такой логин уже занят."),
            ("400", "Пароль слишком короткий или слишком простой."),
        ],
    },
    {
        "id": "auth-login",
        "group": "user",
        "method": "POST",
        "path": "/api/auth/login/",
        "title": "Вход",
        "auth": False,
        "summary": "Проверяет логин и пароль и ставит cookie сессии. Дальше CSRF-токен нужен для всех POST.",
        "body": [
            ("username", "string", "да", "Логин."),
            ("password", "string", "да", "Пароль."),
        ],
        "request": """POST /api/auth/login/
Content-Type: application/json
X-CSRFToken: <токен из cookie csrftoken>

{"username": "demo", "password": "fintwin2026"}""",
        "response": """HTTP 200 OK
{"user": {"id": 1, "username": "demo", "displayName": "Александр Петров", "course": 1, "role": "student"}}""",
        "errors": [("400", "Неверный логин или пароль.")],
    },
    {
        "id": "auth-logout",
        "group": "user",
        "method": "POST",
        "path": "/api/auth/logout/",
        "title": "Выход",
        "auth": True,
        "summary": "Завершает сессию. Тело запроса не нужно.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{"ok": true}""",
        "errors": [],
    },
    {
        "id": "me",
        "group": "user",
        "method": "GET",
        "path": "/api/me/",
        "title": "Профиль и двойник",
        "auth": True,
        "summary": "Возвращает пользователя, восемь компетенций двойника и текущий баланс FinCoin.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "user": {"id": 1, "username": "demo", "course": 1, "role": "student"},
  "twin": {
    "competencies": {
      "data":     {"level": 42, "target": 70},
      "code":     {"level": 35, "target": 65}
    },
    "interests": ["финтех", "данные"],
    "weeklyHours": 12,
    "completedModules": ["mm-01"]
  },
  "balance": 300
}""",
        "errors": [],
    },
    {
        "id": "me-patch",
        "group": "user",
        "method": "PATCH",
        "path": "/api/me/",
        "title": "Изменение профиля",
        "auth": True,
        "summary": "Меняет имя, курс или роль. Остальные поля игнорируются.",
        "body": [
            ("displayName", "string", "нет", "До 120 символов."),
            ("course", "integer", "нет", "Только 1–4."),
            ("role", "string", "нет", "student или partner."),
        ],
        "request": """{"displayName": "Александр Петров", "course": 2}""",
        "response": """HTTP 200 OK
{
  "user": {"displayName": "Александр Петров", "course": 2, "role": "student"},
  "twin": {"competencies": {"...": "..."}},
  "balance": 300
}""",
        "errors": [("400", "Курс должен быть 1–4."), ("400", "Неизвестная роль.")],
    },
    # --- Обучение -------------------------------------------------------
    {
        "id": "bootstrap",
        "group": "learning",
        "method": "GET",
        "path": "/api/bootstrap/",
        "title": "Всё для первого экрана",
        "auth": True,
        "summary": (
            "Единственный «толстый» запрос: консоль поднимается одним вызовом и не делает "
            "десять запросов. Здесь же применяется этическое правило MATCH-001 — в первой "
            "тройке задач всегда есть одна задача на вырост."
        ),
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "user": {...},
  "balance": 300,
  "twin": {...},
  "tasks": [{"id": "task-01", "match": {"score": 78.4, "isStretch": false}}],
  "appliedTaskIds": ["task-03"],
  "modules": [{"id": "mm-01", "title": "Данные: первые шаги", "minutes": 25}],
  "ledger": [{"id": 7, "action": "data_challenge", "amount": 100}],
  "ethicsLog": [{"ruleId": "MATCH-001", "chosen": "task-05"}],
  "values": [{"id": "pervenstvo", "name": "Первенство", "text": null}],
  "ethicsRules": [...],
  "barriers": [...],
  "forecast": [...],
  "decomposePresets": [...],
  "coinAmounts": {"data_challenge": 100},
  "mode": "server"
}""",
        "errors": [],
    },
    {
        "id": "tasks",
        "group": "learning",
        "method": "GET",
        "path": "/api/tasks/",
        "title": "Задачи партнёров",
        "auth": True,
        "summary": "Список задач с рассчитанным процентом совпадения по формуле 40/30/20/10.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "tasks": [
    {
      "id": "task-02",
      "title": "Прогноз оттока клиентов",
      "partnerLabel": "Крупный банк (пример)",
      "difficulty": 3,
      "weeks": 6,
      "match": {
        "score": 81.2,
        "isStretch": true,
        "explanation": "Сильные данные и зона ближайшего развития по ML."
      }
    }
  ]
}""",
        "errors": [],
    },
    {
        "id": "task-apply",
        "group": "learning",
        "method": "POST",
        "path": "/api/tasks/{code}/apply/",
        "title": "Отклик на задачу",
        "auth": True,
        "summary": "Записывает отклик и возвращает план первого месяца и рост компетенций.",
        "body": [("code", "path", "да", "Код задачи из /api/tasks/.")],
        "request": """POST /api/tasks/task-02/apply/""",
        "response": """HTTP 200 OK
{
  "ok": true,
  "plan": [
    {"week": 1, "text": "Разобраться в данных и постановке задачи"},
    {"week": 2, "text": "Собрать базовое решение"}
  ],
  "growth": [
    {"competency": "data", "current": 42, "required": 60, "gap": 18}
  ]
}""",
        "errors": [("404", "Задача не найдена.")],
    },
    {
        "id": "module-complete",
        "group": "learning",
        "method": "POST",
        "path": "/api/modules/{code}/complete/",
        "title": "Прохождение микромодуля",
        "auth": True,
        "summary": (
            "Обновляет компетенции по формуле убывающей отдачи и начисляет +20 за данные "
            "для обучения ИИ. Повторное прохождение отклоняется."
        ),
        "body": [
            ("code", "path", "да", "Код микромодуля."),
            ("performance", "number", "нет", "Доля верных ответов 0–1. По умолчанию 0.8."),
        ],
        "request": """{"performance": 0.67}""",
        "response": """HTTP 200 OK
{
  "ok": true,
  "amount": 20,
  "changes": [{"competency": "data", "before": 42, "after": 47}],
  "twin": {"competencies": {"data": {"level": 47, "target": 70}}},
  "balance": 320
}""",
        "errors": [
            ("400", "Этот модуль уже пройден."),
            ("404", "Модуль не найден."),
        ],
    },
    # --- FinCoin --------------------------------------------------------
    {
        "id": "ledger",
        "group": "money",
        "method": "GET",
        "path": "/api/ledger/",
        "title": "История начислений",
        "auth": True,
        "summary": "Все записи реестра и текущий баланс.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "entries": [
    {
      "id": 7,
      "ts": 1795700000000,
      "action": "data_challenge",
      "amount": 100,
      "basis": "Задача «Прогноз оттока»: код прошёл автотесты",
      "valueIds": ["pervenstvo"],
      "prevHash": "6f1c...a3",
      "hash": "b90d...11"
    }
  ],
  "balance": 300,
  "coinAmounts": {"ai_training_data": 20, "data_challenge": 100}
}""",
        "errors": [],
    },
    {
        "id": "ledger-award",
        "group": "money",
        "method": "POST",
        "path": "/api/ledger/award/",
        "title": "Начисление FinCoin",
        "auth": True,
        "summary": (
            "Добавляет запись в реестр. Одно основание нельзя засчитать дважды, действуют "
            "дневные лимиты, каждая запись хэшируется вместе с предыдущей."
        ),
        "body": [
            ("action", "string", "да", "Одно из шести действий из таблицы лимитов."),
            ("basis", "string", "да", "За что именно начислено. Показывается в ленте."),
            ("valueIds", "string[]", "нет", "Коды ценностей, которые поддерживает действие."),
        ],
        "request": """{
  "action": "data_challenge",
  "basis": "Задача «Прогноз оттока»: код прошёл автотесты",
  "valueIds": ["pervenstvo"]
}""",
        "response": """HTTP 200 OK
{
  "ok": true,
  "amount": 100,
  "entry": {"id": 8, "action": "data_challenge", "hash": "3ac1...0f"},
  "balance": 400
}""",
        "errors": [
            ("400", "Такое основание уже засчитано."),
            ("400", "Дневной лимит по этому действию исчерпан."),
        ],
    },
    {
        "id": "ledger-verify",
        "group": "money",
        "method": "POST",
        "path": "/api/ledger/verify/",
        "title": "Проверка цепочки",
        "auth": True,
        "summary": "Пересчитывает SHA-256 по всей цепочке и сообщает номер первой повреждённой записи.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{"valid": true, "brokenAt": null, "count": 6}""",
        "errors": [],
    },
    # --- Этика и аналитика ----------------------------------------------
    {
        "id": "ethics",
        "group": "ethics",
        "method": "GET",
        "path": "/api/ethics/",
        "title": "Ценности, правила и журнал",
        "auth": True,
        "summary": "Десять ценностей, правила этического фильтра и решения ИИ с обоснованием.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "values": [{"id": "poradochnost", "name": "Порядочность", "text": null}],
  "rules": [{"id": "MATCH-001", "valueId": "pervenstvo", "module": "matcher"}],
  "decisions": [
    {
      "id": 12,
      "ruleId": "MATCH-001",
      "summary": "В топ-3 добавлена задача на вырост",
      "rejected": [{"reason": "слишком лёгкая", "valueId": "pervenstvo"}]
    }
  ]
}""",
        "errors": [],
    },
    {
        "id": "barriers",
        "group": "ethics",
        "method": "GET",
        "path": "/api/diagnostics/barriers/",
        "title": "Барьеры кооперации",
        "auth": True,
        "summary": "Двадцать барьеров для тепловой карты: тип, стадия, острота, чем снимается.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "barriers": [
    {
      "id": "adm-01",
      "category": "administrative",
      "stage": "agreement",
      "severity": 2,
      "solvedBy": "decomposer"
    }
  ]
}""",
        "errors": [],
    },
    {
        "id": "forecast",
        "group": "ethics",
        "method": "GET",
        "path": "/api/diagnostics/forecast/",
        "title": "Прогноз навыков",
        "auth": True,
        "summary": "Демонстрационные кривые спроса на навыки на 1–5 лет вперёд.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{"forecast": [{"year": 2026, "skills": {"data": 62, "ai": 71}}]}""",
        "errors": [],
    },
    {
        "id": "decompose",
        "group": "ethics",
        "method": "POST",
        "path": "/api/decompose/",
        "title": "Декомпозиция задачи партнёра",
        "auth": True,
        "summary": "Раскладывает запрос индустрии на учебные кейсы по курсам 1–4 с суммой FinCoin на каждом узле.",
        "body": [
            ("title", "string", "да*", "Название задачи. *Можно не передавать, если указан preset."),
            ("tags", "string[]", "нет", "Теги: data, ml, security, fintech."),
            ("preset", "string", "нет", "Код готового примера из decomposePresets."),
        ],
        "request": """{"title": "Оценка кредитного риска", "tags": ["data", "fintech"]}""",
        "response": """HTTP 200 OK
{
  "cases": [
    {"course": 1, "title": "Разобрать данные", "coins": 20},
    {"course": 3, "title": "Собрать модель", "coins": 100}
  ],
  "totalCoins": 260
}""",
        "errors": [("400", "Укажите название задачи.")],
    },
    # --- Служебные ------------------------------------------------------
    {
        "id": "csrf",
        "group": "system",
        "method": "GET",
        "path": "/api/csrf/",
        "title": "Получить CSRF-cookie",
        "auth": False,
        "summary": "Нужен до первого POST: фронтенд берёт токен из cookie и отправляет его заголовком.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
Set-Cookie: csrftoken=...; Path=/; SameSite=Lax
{"ok": true}""",
        "errors": [],
    },
    {
        "id": "health",
        "group": "system",
        "method": "GET",
        "path": "/api/health/",
        "title": "Проверка живости",
        "auth": False,
        "summary": "Дешёвый ответ для балансировщика и внешнего монитора. Без обращения к базе.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{"status": "ok", "service": "fintwin-api"}""",
        "errors": [],
    },
    {
        "id": "status",
        "group": "system",
        "method": "GET",
        "path": "/api/status/",
        "title": "Статус и uptime",
        "auth": False,
        "summary": (
            "Живые проверки компонентов, история за 30 дней и список инцидентов. "
            "На этом эндпоинте работает страница /status/."
        ),
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{
  "overall": "operational",
  "overallLabel": "Все системы работают",
  "components": [{"code": "api", "ok": true, "latencyMs": 3}],
  "uptime": {"days": 3, "checks": 412, "uptime": 99.76, "avgLatencyMs": 18},
  "days": [{"date": "2026-11-27", "uptime": 100.0, "total": 144}]
}""",
        "errors": [],
    },
    {
        "id": "demo-reset",
        "group": "system",
        "method": "POST",
        "path": "/api/demo/reset/",
        "title": "Сброс демо",
        "auth": True,
        "summary": "Возвращает реестр и журнал этики к исходному состоянию. Данные профиля не трогает.",
        "body": [],
        "request": None,
        "response": """HTTP 200 OK
{"ok": true, "balance": 300}""",
        "errors": [],
    },
]

ENDPOINT_GROUPS = [
    {"id": "user", "title": "Пользователь и сессия", "lead": "Регистрация, вход и профиль."},
    {"id": "learning", "title": "Обучение и задачи", "lead": "Двойник, матчинг и микромодули."},
    {"id": "money", "title": "FinCoin и реестр", "lead": "Начисления, лимиты и проверка цепочки."},
    {"id": "ethics", "title": "Этика и аналитика", "lead": "Ценности, барьеры, прогноз и декомпозиция."},
    {"id": "system", "title": "Служебные", "lead": "CSRF, живость, статус и сброс демо."},
]


def _nav() -> list[dict]:
    """Оглавление собирается из тех же данных, что и страница."""
    items = [
        {"group": "Начало работы", "id": "start", "items": [
            {"id": "overview", "title": "Обзор"},
            {"id": "auth", "title": "Аутентификация"},
            {"id": "quickstart", "title": "Быстрый старт"},
        ]},
    ]
    for group in ENDPOINT_GROUPS:
        items.append(
            {
                "group": group["title"],
                "id": group["id"],
                "items": [
                    {"id": f"endpoint-{item['id']}", "title": item["title"]}
                    for item in ENDPOINTS
                    if item["group"] == group["id"]
                ],
            }
        )
    items.append(
        {
            "group": "Справочник",
            "id": "reference",
            "items": [
                {"id": "models", "title": "Объекты"},
                {"id": "errors", "title": "Ошибки"},
                {"id": "limits", "title": "Лимиты FinCoin"},
                {"id": "rules", "title": "Правила и версии"},
            ],
        }
    )
    return items


DOC_NAV = _nav()

QUICKSTART = dedent(
    """\
    # 1. Получить CSRF-cookie и войти демо-студентом
    curl -c cookies.txt https://fintwin.duckdns.org/api/csrf/
    curl -b cookies.txt -c cookies.txt -X POST https://fintwin.duckdns.org/demo-login/

    # 2. Забрать всё, что нужно консоли, одним запросом
    curl -b cookies.txt https://fintwin.duckdns.org/api/bootstrap/

    # 3. Начислить FinCoin за задачу партнёра
    curl -b cookies.txt -X POST https://fintwin.duckdns.org/api/ledger/award/ \\
      -H "Content-Type: application/json" \\
      -H "X-CSRFToken: $(grep csrftoken cookies.txt | awk '{print $7}')" \\
      -d '{"action": "data_challenge", "basis": "task-02: автотесты пройдены"}'
    """
).strip()


def endpoint_count() -> int:
    return len(ENDPOINTS)
