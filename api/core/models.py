"""Модели предметной области «ФинТвин».

Слой без представлений: его используют и API, и серверные страницы.
Все демонстрационные сущности помечены флагом is_mock.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone

COMPETENCY_CHOICES = [
    ("data", "Данные"),
    ("code", "Программирование"),
    ("finance", "Финансы и экономика"),
    ("comm", "Коммуникация"),
    ("research", "Исследование"),
    ("entre", "Предпринимательство"),
    ("ai", "ИИ-грамотность"),
    ("lead", "Лидерство"),
]


class Value(models.Model):
    """Корпоративная ценность. official_text = null, пока текст не передан командой."""

    code = models.SlugField("Код", max_length=32, unique=True)
    name = models.CharField("Название", max_length=120)
    official_text = models.TextField("Официальная формулировка", null=True, blank=True)
    order = models.PositiveSmallIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Ценность"
        verbose_name_plural = "Ценности"

    def __str__(self) -> str:
        return self.name


class EthicsRule(models.Model):
    """Правило этического фильтра: данные + описание поведения."""

    VALID_MODULES = [
        ("matcher", "ИИ-сват"),
        ("twin", "Двойник"),
        ("wallet", "Кошелёк"),
        ("decomposer", "Декомпозиция"),
        ("patents", "Радар патентов"),
    ]

    code = models.CharField("Идентификатор правила", max_length=32, unique=True)
    value = models.ForeignKey(Value, on_delete=models.PROTECT, related_name="rules")
    module = models.CharField("Модуль", max_length=16, choices=VALID_MODULES)
    title = models.CharField("Название", max_length=160)
    algorithm = models.TextField("Как зашито в алгоритм")
    without = models.TextField("Пример без этики", blank=True)
    with_example = models.TextField("Пример с этикой", blank=True)

    class Meta:
        ordering = ["code"]
        verbose_name = "Правило этики"
        verbose_name_plural = "Правила этики"

    def __str__(self) -> str:
        return f"{self.code} · {self.title}"


class Micromodule(models.Model):
    class Kind(models.TextChoices):
        LEARN = "learn", "Обучение"
        PRACTICE = "practice", "Практика"
        MENTOR = "mentor", "Наставничество"

    code = models.CharField("Код", max_length=32, unique=True)
    title = models.CharField("Название", max_length=200)
    minutes = models.PositiveSmallIntegerField("Минут")
    difficulty = models.PositiveSmallIntegerField("Сложность 1–5")
    kind = models.CharField("Тип", max_length=16, choices=Kind.choices)
    gains = models.JSONField("Прирост компетенций", default=dict)
    value_codes = models.JSONField("Ценности", default=list)
    is_mock = models.BooleanField("Демо-данные", default=True)

    class Meta:
        ordering = ["minutes", "code"]
        verbose_name = "Микромодуль"
        verbose_name_plural = "Микромодули"

    def __str__(self) -> str:
        return self.title


class PartnerTask(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Набор открыт"
        CLOSED = "closed", "Набор закрыт"

    code = models.CharField("Код", max_length=32, unique=True)
    title = models.CharField("Название", max_length=200)
    partner_label = models.CharField("Партнёр (текстом)", max_length=160)
    summary = models.TextField("Описание")
    required = models.JSONField("Требуемые компетенции", default=dict)
    difficulty = models.PositiveSmallIntegerField("Сложность 1–5")
    weeks = models.PositiveSmallIntegerField("Недель")
    tags = models.JSONField("Теги", default=list)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_tasks",
        verbose_name="Автор задачи",
    )
    status = models.CharField(
        "Статус набора", max_length=16, choices=Status.choices, default=Status.OPEN
    )
    created_at = models.DateTimeField("Создана", default=timezone.now)
    is_mock = models.BooleanField("Демо-данные", default=True)

    class Meta:
        ordering = ["difficulty", "code"]
        verbose_name = "Задача партнёра"
        verbose_name_plural = "Задачи партнёров"

    def __str__(self) -> str:
        return self.title


class TaskApplication(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Новый отклик"
        SHORTLISTED = "shortlisted", "В шортлисте"
        INVITED = "invited", "Приглашён"
        REJECTED = "rejected", "Отклонён"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    task = models.ForeignKey(PartnerTask, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField("Статус", max_length=16, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "task")
        ordering = ["-created_at"]
        verbose_name = "Отклик на задачу"
        verbose_name_plural = "Отклики на задачи"


class Twin(models.Model):
    """Цифровой двойник: компетенции, интерес, свободные часы."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="twin")
    competencies = models.JSONField("Компетенции", default=dict)
    interests = models.JSONField("Интересы", default=list)
    weekly_hours = models.PositiveSmallIntegerField("Свободных часов в неделю", default=12)
    completed_modules = models.JSONField("Пройденные модули", default=list)
    is_mock = models.BooleanField("Демо-данные", default=True)

    class Meta:
        verbose_name = "Цифровой двойник"
        verbose_name_plural = "Цифровые двойники"

    def __str__(self) -> str:
        return f"Двойник {self.user}"


class Barrier(models.Model):
    class Category(models.TextChoices):
        ADMIN = "administrative", "Административные"
        INFO = "informational", "Информационные"
        CULTURAL = "cultural", "Культурные"

    class Stage(models.TextChoices):
        SEARCH = "search", "Поиск партнёра"
        AGREEMENT = "agreement", "Согласование"
        LAUNCH = "launch", "Запуск проекта"
        EVALUATION = "evaluation", "Оценка результата"
        SCALE = "scale", "Масштабирование"

    code = models.CharField("Код", max_length=32, unique=True)
    category = models.CharField("Категория", max_length=16, choices=Category.choices)
    title = models.CharField("Название", max_length=200)
    stage = models.CharField("Стадия", max_length=16, choices=Stage.choices)
    severity = models.PositiveSmallIntegerField("Интенсивность 0–3", default=1)
    solved_by = models.CharField("Решается модулем", max_length=32)
    note = models.TextField("Пояснение")
    is_mock = models.BooleanField("Демо-данные", default=True)

    class Meta:
        ordering = ["category", "stage", "code"]
        verbose_name = "Барьер"
        verbose_name_plural = "Барьеры"

    def __str__(self) -> str:
        return self.title


class LedgerEntry(models.Model):
    """Запись реестра FinCoin с цепочкой хэшей."""

    ACTIONS = [
        ("ai_training_data", "Данные для обучения ИИ"),
        ("data_challenge", "Решение Data Challenge"),
        ("mentoring", "Наставничество"),
        ("anomaly_report", "Отчёт об аномалии"),
        ("market_value", "Рыночная ценность"),
        ("knowledge_export", "Экспорт знаний"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ledger_entries"
    )
    created_at = models.DateTimeField("Создано", default=timezone.now)
    action = models.CharField("Действие", max_length=32, choices=ACTIONS)
    amount = models.PositiveIntegerField("Сумма")
    basis = models.TextField("Основание")
    value_codes = models.JSONField("Ценности", default=list)
    prev_hash = models.CharField("Хэш предыдущей записи", max_length=64)
    hash = models.CharField("Хэш записи", max_length=64)

    class Meta:
        ordering = ["created_at", "id"]
        constraints = [
            models.UniqueConstraint(fields=["user", "basis"], name="unique_basis_per_user"),
        ]
        verbose_name = "Запись реестра"
        verbose_name_plural = "Реестр FinCoin"

    def __str__(self) -> str:
        return f"{self.action} +{self.amount} ({self.user})"


class EthicsDecision(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ethics_decisions"
    )
    created_at = models.DateTimeField("Создано", default=timezone.now)
    module = models.CharField("Модуль", max_length=16)
    rule_id = models.CharField("Правило", max_length=32)
    summary = models.TextField("Кратко")
    considered = models.JSONField("Рассмотрено", default=list)
    rejected = models.JSONField("Отклонено", default=list)
    chosen = models.CharField("Выбрано", max_length=120, blank=True)
    value_codes = models.JSONField("Ценности", default=list)
    is_mock = models.BooleanField("Демо-данные", default=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Решение ИИ"
        verbose_name_plural = "Журнал решений ИИ"

    def __str__(self) -> str:
        return f"{self.rule_id}: {self.summary[:60]}"


class StatusSample(models.Model):
    """Замер доступности сервиса.

    Это реальные данные мониторинга, поэтому флага is_mock здесь нет:
    каждая строка появляется в момент настоящей проверки компонента.
    """

    component = models.CharField("Компонент", max_length=32, db_index=True)
    ok = models.BooleanField("Доступен", default=True)
    latency_ms = models.PositiveIntegerField("Задержка, мс", default=0)
    created_at = models.DateTimeField("Замер", default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["component", "created_at"], name="status_component_time")]
        verbose_name = "Замер доступности"
        verbose_name_plural = "Мониторинг доступности"

    def __str__(self) -> str:
        return f"{self.component}: {'ok' if self.ok else 'fail'} {self.latency_ms}ms"


class Incident(models.Model):
    """Инцидент на странице статуса. Заводится вручную из админки, когда что-то падало."""

    class Severity(models.TextChoices):
        DEGRADED = "degraded", "Деградация"
        PARTIAL = "partial", "Частичный отказ"
        OUTAGE = "outage", "Отказ"

    component = models.CharField("Компонент", max_length=32, blank=True)
    title = models.CharField("Заголовок", max_length=160)
    summary = models.TextField("Описание", blank=True)
    severity = models.CharField(
        "Уровень", max_length=16, choices=Severity.choices, default=Severity.DEGRADED
    )
    started_at = models.DateTimeField("Начало", default=timezone.now)
    resolved_at = models.DateTimeField("Восстановлено", null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]
        verbose_name = "Инцидент"
        verbose_name_plural = "Инциденты"

    @property
    def is_open(self) -> bool:
        return self.resolved_at is None

    def __str__(self) -> str:
        return self.title
