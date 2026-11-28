"""Кабинет партнёра: свои задачи, отклики студентов и сводка по спросу.

Партнёр — отдельная роль: он публикует задачи и ведёт отклики, но не откликается
сам, не проходит микромодули и не получает FinCoin.
"""
from __future__ import annotations

from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api import serializers as s
from core.models import COMPETENCY_CHOICES, PartnerTask, TaskApplication
from core.services.matching import calculate_match

LABELS = dict(COMPETENCY_CHOICES)
SKILL_MIN, SKILL_MAX = 10, 100


def is_partner(user) -> bool:
    return getattr(user, "role", "") == "partner"


def _forbidden(message: str) -> Response:
    return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)


def _bad(message: str) -> Response:
    return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)


def _match_for(application: TaskApplication) -> float | None:
    twin = getattr(application.user, "twin", None)
    if twin is None:
        return None
    return calculate_match(twin, application.task).score


def _clean_required(raw) -> tuple[dict, str | None]:
    """Компетенции задачи: только известные коды и уровни 10–100."""
    if raw in (None, ""):
        return {}, None
    if not isinstance(raw, dict):
        return {}, "Требования должны быть объектом «компетенция → уровень»."

    cleaned = {}
    for code, value in raw.items():
        if code not in LABELS:
            return {}, f"Неизвестная компетенция: {code}."
        try:
            level = int(value)
        except (TypeError, ValueError):
            return {}, "Уровень компетенции должен быть числом."
        if not SKILL_MIN <= level <= SKILL_MAX:
            return {}, f"Уровень должен быть от {SKILL_MIN} до {SKILL_MAX}."
        cleaned[code] = level
    return cleaned, None


def _clean_tags(raw) -> list[str]:
    if not isinstance(raw, list):
        return []
    tags: list[str] = []
    for item in raw:
        text = str(item).strip()[:32]
        if text and text not in tags:
            tags.append(text)
    return tags[:6]


def _next_code() -> str:
    numbers = []
    for code in PartnerTask.objects.filter(code__startswith="task-").values_list("code", flat=True):
        try:
            numbers.append(int(code.split("-")[-1]))
        except ValueError:
            continue
    return f"task-{max(numbers, default=0) + 1}"


def _validate_task(data) -> tuple[dict, Response | None]:
    title = str(data.get("title") or "").strip()
    summary = str(data.get("summary") or "").strip()
    required, error = _clean_required(data.get("required"))

    if error:
        return {}, _bad(error)
    if len(title) < 5:
        return {}, _bad("Название короче пяти символов.")
    if len(summary) < 20:
        return {}, _bad("Описание короче двадцати символов — студенту не хватит контекста.")

    try:
        difficulty = int(data.get("difficulty") or 3)
        weeks = int(data.get("weeks") or 6)
    except (TypeError, ValueError):
        return {}, _bad("Сложность и срок должны быть числами.")
    if difficulty not in range(1, 6):
        return {}, _bad("Сложность должна быть от 1 до 5.")
    if not 1 <= weeks <= 52:
        return {}, _bad("Срок должен быть от 1 до 52 недель.")

    return {
        "title": title[:200],
        "summary": summary[:2000],
        "required": required,
        "difficulty": difficulty,
        "weeks": weeks,
        "tags": _clean_tags(data.get("tags")),
    }, None


@api_view(["GET"])
def overview(request):
    if not is_partner(request.user):
        return _forbidden("Сводка доступна только партнёру.")

    tasks = list(PartnerTask.objects.filter(owner=request.user).order_by("-created_at"))
    applications = list(
        TaskApplication.objects.filter(task__owner=request.user)
        .select_related("user", "task", "user__twin")
        .order_by("-created_at")[:20]
    )

    demand: dict[str, int] = {}
    for task in tasks:
        for code, level in (task.required or {}).items():
            if level:
                demand[code] = demand.get(code, 0) + 1
    demand_list = [
        {"id": code, "label": LABELS.get(code, code), "count": count}
        for code, count in sorted(demand.items(), key=lambda item: -item[1])[:5]
    ]

    by_status = {choice: 0 for choice, _label in TaskApplication.Status.choices}
    for item in TaskApplication.objects.filter(task__owner=request.user).values("status").annotate(
        total=Count("id")
    ):
        by_status[item["status"]] = item["total"]

    difficulty = round(sum(task.difficulty for task in tasks) / len(tasks), 1) if tasks else 0

    return Response(
        {
            "stats": {
                "tasks": len(tasks),
                "openTasks": sum(1 for task in tasks if task.status == PartnerTask.Status.OPEN),
                "applications": sum(by_status.values()),
                "students": len({item.user_id for item in applications}),
                "difficulty": difficulty,
            },
            "byStatus": by_status,
            "demand": demand_list,
            "tasks": [s.partner_task_payload(task) for task in tasks],
            "applications": [s.application_payload(item, _match_for(item)) for item in applications],
            "competencies": [{"id": code, "label": label} for code, label in COMPETENCY_CHOICES],
        }
    )


@api_view(["GET", "POST"])
def tasks(request):
    if not is_partner(request.user):
        return _forbidden("Задачи публикует только партнёр.")

    if request.method == "GET":
        items = PartnerTask.objects.filter(owner=request.user).order_by("-created_at")
        return Response({"tasks": [s.partner_task_payload(task) for task in items]})

    fields, error = _validate_task(request.data)
    if error is not None:
        return error

    task = PartnerTask.objects.create(
        code=_next_code(),
        partner_label=(request.user.display_name or "Партнёр (пример)")[:160],
        owner=request.user,
        is_mock=True,
        **fields,
    )
    return Response({"task": s.partner_task_payload(task)}, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
def task_detail(request, code: str):
    if not is_partner(request.user):
        return _forbidden("Задача доступна только её автору.")

    task = PartnerTask.objects.filter(code=code, owner=request.user).first()
    if task is None:
        return Response({"detail": "Задача не найдена."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "GET":
        return Response({"task": s.partner_task_payload(task)})

    data = request.data
    merged = {
        "title": data.get("title", task.title),
        "summary": data.get("summary", task.summary),
        "required": data.get("required", task.required),
        "difficulty": data.get("difficulty", task.difficulty),
        "weeks": data.get("weeks", task.weeks),
        "tags": data.get("tags", task.tags),
    }
    fields, error = _validate_task(merged)
    if error is not None:
        return error

    for name, value in fields.items():
        setattr(task, name, value)
    task.save()
    return Response({"task": s.partner_task_payload(task)})


@api_view(["POST"])
def task_status(request, code: str):
    if not is_partner(request.user):
        return _forbidden("Менять статус задачи может только её автор.")

    task = PartnerTask.objects.filter(code=code, owner=request.user).first()
    if task is None:
        return Response({"detail": "Задача не найдена."}, status=status.HTTP_404_NOT_FOUND)

    value = request.data.get("status")
    if value not in dict(PartnerTask.Status.choices):
        return _bad("Неизвестный статус задачи.")

    task.status = value
    task.save(update_fields=["status"])
    return Response({"task": s.partner_task_payload(task)})


@api_view(["GET"])
def applications(request):
    if not is_partner(request.user):
        return _forbidden("Отклики доступны только партнёру.")

    queryset = TaskApplication.objects.filter(task__owner=request.user).select_related(
        "user", "task", "user__twin"
    )
    task_code = request.GET.get("task")
    if task_code:
        queryset = queryset.filter(task__code=task_code)
    status_filter = request.GET.get("status")
    if status_filter in dict(TaskApplication.Status.choices):
        queryset = queryset.filter(status=status_filter)

    items = queryset.order_by("-created_at")[:100]
    return Response({"applications": [s.application_payload(item, _match_for(item)) for item in items]})


@api_view(["PATCH"])
def application_detail(request, application_id: int):
    if not is_partner(request.user):
        return _forbidden("Отклики ведёт только партнёр.")

    application = (
        TaskApplication.objects.filter(id=application_id, task__owner=request.user)
        .select_related("user", "task", "user__twin")
        .first()
    )
    if application is None:
        return Response({"detail": "Отклик не найден."}, status=status.HTTP_404_NOT_FOUND)

    value = request.data.get("status")
    if value not in dict(TaskApplication.Status.choices):
        return _bad("Неизвестный статус отклика.")

    application.status = value
    application.save(update_fields=["status", "updated_at"])
    return Response({"application": s.application_payload(application, _match_for(application))})
