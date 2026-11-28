"""JSON API консоли «ФинТвин».

Контракт намеренно один: GET /api/bootstrap/ отдаёт всё, что нужно экрану,
а действия — отдельными командами. Так фронтенд не делает 10 запросов.
"""
from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.models import User
from api import serializers as s
from core import seed_data
from core.models import (
    Barrier,
    EthicsDecision,
    EthicsRule,
    LedgerEntry,
    Micromodule,
    PartnerTask,
    TaskApplication,
    Twin,
    Value,
)
from core.services.decompose import PRESETS, decompose
from core.services.demo import reset_demo
from core.services.ethics import ensure_stretch_in_top3
from core.services.ledger import COIN_AMOUNTS, award, verify_chain, LedgerError
from core.services.matching import calculate_match
from core.services.twin import update_after_module


def _default_competencies() -> dict:
    return {
        code: {"level": 20, "target": 60}
        for code in ["data", "code", "finance", "comm", "research", "entre", "ai", "lead"]
    }


def _twin_for(user) -> Twin:
    twin, _ = Twin.objects.get_or_create(
        user=user,
        defaults={
            "competencies": _default_competencies(),
            "interests": [],
            "weekly_hours": 12,
            "completed_modules": [],
            "is_mock": True,
        },
    )
    return twin


def _balance(user) -> int:
    return sum(entry.amount for entry in user.ledger_entries.all())


def _log_match_decision(user, decision: dict) -> None:
    """Пишем решение MATCH-001 в журнал не чаще одного раза в день на вариант."""
    if not decision:
        return
    today = timezone.localdate()
    exists = user.ethics_decisions.filter(
        rule_id=decision["ruleId"],
        chosen=decision["chosen"],
        created_at__date=today,
    ).exists()
    if exists:
        return
    EthicsDecision.objects.create(
        user=user,
        module=decision["module"],
        rule_id=decision["ruleId"],
        summary=decision["summary"],
        considered=decision["considered"],
        rejected=decision["rejected"],
        chosen=decision["chosen"],
        value_codes=decision["valueIds"],
        is_mock=True,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    username = (data.get("username") or data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("displayName") or data.get("display_name") or "").strip()

    if not username or not password:
        return Response({"detail": "Укажите логин и пароль."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except ValidationError as exc:
        return Response({"detail": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            email=data.get("email") or "",
            password=password,
            display_name=display_name or username,
            course=int(data.get("course") or 1),
        )
    except IntegrityError:
        return Response({"detail": "Такой логин уже занят."}, status=status.HTTP_400_BAD_REQUEST)

    _twin_for(user)
    login(request, user)
    return Response({"user": s.user_payload(user)}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = (request.data.get("username") or request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"detail": "Неверный логин или пароль."}, status=status.HTTP_400_BAD_REQUEST)
    login(request, user)
    return Response({"user": s.user_payload(user)})


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"ok": True})


@api_view(["GET", "PATCH"])
def me(request):
    user = request.user
    twin = _twin_for(user)

    if request.method == "PATCH":
        data = request.data
        user_changed = False
        twin_changed = []

        if "displayName" in data:
            name = str(data["displayName"]).strip()[:120]
            if len(name) < 2:
                return Response({"detail": "Имя короче двух символов."}, status=400)
            user.display_name = name
            user_changed = True
        if "course" in data:
            try:
                course = int(data["course"])
            except (TypeError, ValueError):
                return Response({"detail": "Курс должен быть числом 1–4."}, status=400)
            if course not in (1, 2, 3, 4):
                return Response({"detail": "Курс должен быть 1–4."}, status=400)
            user.course = course
            user_changed = True
        if "role" in data:
            if data["role"] not in dict(User.Role.choices):
                return Response({"detail": "Неизвестная роль."}, status=400)
            user.role = data["role"]
            user_changed = True

        if "interests" in data:
            raw = data["interests"]
            if not isinstance(raw, list):
                return Response({"detail": "Интересы должны быть списком."}, status=400)
            cleaned: list[str] = []
            for item in raw:
                text = str(item).strip()[:32]
                if text and text not in cleaned:
                    cleaned.append(text)
            if len(cleaned) > 8:
                return Response({"detail": "Не больше 8 интересов."}, status=400)
            twin.interests = cleaned
            twin_changed.append("interests")

        if "weeklyHours" in data:
            try:
                hours = int(data["weeklyHours"])
            except (TypeError, ValueError):
                return Response({"detail": "Часы должны быть числом."}, status=400)
            if not 1 <= hours <= 40:
                return Response({"detail": "Часы должны быть от 1 до 40."}, status=400)
            twin.weekly_hours = hours
            twin_changed.append("weekly_hours")

        if user_changed:
            user.save()
        if twin_changed:
            twin.save(update_fields=twin_changed)

    return Response(
        {
            "user": s.user_payload(user),
            "twin": s.twin_payload(twin),
            "balance": _balance(user),
        }
    )


@api_view(["GET"])
@ensure_csrf_cookie
def bootstrap(request):
    user = request.user
    twin = _twin_for(user)
    completed = set(twin.completed_modules or [])

    tasks = list(PartnerTask.objects.all())
    matches = [{"task": task, "match": calculate_match(twin, task)} for task in tasks]
    ordered, decision = ensure_stretch_in_top3(
        [
            {
                "taskId": item["task"].code,
                "title": item["task"].title,
                "isStretch": item["match"].is_stretch,
                "score": item["match"].score,
            }
            for item in matches
        ]
    )
    _log_match_decision(user, decision)

    by_code = {item["task"].code: item for item in matches}
    ranked = [by_code[item["taskId"]] for item in ordered if item["taskId"] in by_code]

    return Response(
        {
            "user": s.user_payload(user),
            "balance": _balance(user),
            "twin": s.twin_payload(twin),
            "tasks": [s.task_payload(item["task"], item["match"]) for item in ranked],
            "appliedTaskIds": list(
                TaskApplication.objects.filter(user=user).values_list("task__code", flat=True)
            ),
            "modules": [s.module_payload(module, completed) for module in Micromodule.objects.all()],
            "ledger": [s.ledger_payload(entry) for entry in user.ledger_entries.all()],
            "ethicsLog": [s.ethics_payload(item) for item in user.ethics_decisions.all()],
            "values": [s.value_payload(value) for value in Value.objects.all()],
            "ethicsRules": [s.rule_payload(rule) for rule in EthicsRule.objects.select_related("value")],
            "barriers": [s.barrier_payload(barrier) for barrier in Barrier.objects.all()],
            "forecast": seed_data.FORECAST,
            "decomposePresets": PRESETS,
            "coinAmounts": COIN_AMOUNTS,
            "mode": "server",
        }
    )


@api_view(["GET"])
def tasks(request):
    twin = _twin_for(request.user)
    items = [
        s.task_payload(task, calculate_match(twin, task)) for task in PartnerTask.objects.all()
    ]
    return Response({"tasks": items})


@api_view(["POST"])
def apply_to_task(request, code: str):
    if request.user.role == User.Role.PARTNER:
        return Response(
            {"detail": "Партнёр публикует задачи и ведёт отклики, а откликается студент."},
            status=status.HTTP_403_FORBIDDEN,
        )

    task = PartnerTask.objects.filter(code=code).first()
    if task is None:
        return Response({"detail": "Задача не найдена."}, status=404)

    if task.status == PartnerTask.Status.CLOSED:
        return Response({"detail": "Набор на эту задачу закрыт."}, status=400)

    application, _created = TaskApplication.objects.get_or_create(user=request.user, task=task)
    twin = _twin_for(request.user)
    growth = []
    for competency, required in task.required.items():
        current = twin.competencies.get(competency, {})
        level = float(current.get("level", 0)) if isinstance(current, dict) else 0
        growth.append(
            {
                "competency": competency,
                "label": competency,
                "current": round(level),
                "required": required,
                "gap": max(0, required - round(level)),
            }
        )

    plan = [
        {"week": 1, "text": "Разобраться в данных и постановке задачи, согласовать критерии успеха."},
        {"week": 2, "text": "Собрать базовое решение и показать черновик наставнику."},
        {"week": 3, "text": "Усилить решение, проверить на тестовых примерах, исправить ошибки."},
        {"week": 4, "text": "Оформить результат и защитить его перед партнёром."},
    ]
    return Response({"ok": True, "plan": plan, "growth": growth, "status": application.status})


@api_view(["POST"])
def complete_module(request, code: str):
    if request.user.role == User.Role.PARTNER:
        return Response(
            {"detail": "Микромодули проходит студент: у партнёра другой кабинет."},
            status=status.HTTP_403_FORBIDDEN,
        )

    module = Micromodule.objects.filter(code=code).first()
    if module is None:
        return Response({"detail": "Модуль не найден."}, status=404)

    twin = _twin_for(request.user)
    if code in (twin.completed_modules or []):
        return Response({"ok": False, "reason": "Этот модуль уже пройден."}, status=400)

    performance = float(request.data.get("performance", 0.8))
    performance = max(0.0, min(1.0, performance))
    changes = update_after_module(twin, module, performance)

    award_info = {"ok": True}
    try:
        entry = award(
            request.user,
            "ai_training_data",
            f"Микромодуль «{module.title}»: ошибки помогли улучшить ИИ-тьютора",
            module.value_codes,
        )
        award_info = {"ok": True, "amount": entry.amount}
    except LedgerError as exc:
        award_info = {"ok": False, "reason": str(exc)}

    twin.refresh_from_db()
    return Response(
        {
            **award_info,
            "changes": changes,
            "twin": s.twin_payload(twin),
            "balance": _balance(request.user),
        }
    )


@api_view(["GET"])
def ledger_list(request):
    entries = list(request.user.ledger_entries.all())
    return Response(
        {
            "entries": [s.ledger_payload(entry) for entry in entries],
            "balance": _balance(request.user),
            "coinAmounts": COIN_AMOUNTS,
        }
    )


@api_view(["POST"])
def ledger_award(request):
    if request.user.role == User.Role.PARTNER:
        return Response(
            {"detail": "FinCoin начисляется студенту за вклад, партнёр его не получает."},
            status=status.HTTP_403_FORBIDDEN,
        )

    action = request.data.get("action")
    basis = request.data.get("basis")
    value_ids = request.data.get("valueIds") or []
    try:
        entry = award(request.user, action, basis, value_ids)
    except LedgerError as exc:
        return Response({"ok": False, "reason": str(exc)}, status=400)
    return Response(
        {
            "ok": True,
            "amount": entry.amount,
            "entry": s.ledger_payload(entry),
            "balance": _balance(request.user),
        }
    )


@api_view(["POST"])
def ledger_verify(request):
    entries = list(request.user.ledger_entries.all())
    valid, broken_at = verify_chain(entries)
    return Response({"valid": valid, "brokenAt": broken_at, "count": len(entries)})


@api_view(["GET"])
def ethics(request):
    return Response(
        {
            "values": [s.value_payload(value) for value in Value.objects.all()],
            "rules": [s.rule_payload(rule) for rule in EthicsRule.objects.select_related("value")],
            "decisions": [s.ethics_payload(item) for item in request.user.ethics_decisions.all()],
        }
    )


@api_view(["GET"])
def barriers(request):
    return Response({"barriers": [s.barrier_payload(item) for item in Barrier.objects.all()]})


@api_view(["GET"])
def forecast(request):
    return Response({"forecast": seed_data.FORECAST})


@api_view(["POST"])
def decompose_task(request):
    title = (request.data.get("title") or "").strip()
    tags = request.data.get("tags") or []
    preset_code = request.data.get("preset")
    from core.services.decompose import find_preset

    preset = find_preset(preset_code)
    if not title and preset:
        title = preset["label"]
    if not title:
        return Response({"detail": "Укажите название задачи."}, status=400)
    result = decompose(title=title, tags=tags)
    return Response(result)


@api_view(["POST"])
def demo_reset(request):
    """Возвращает демо-студента к исходному состоянию (реестр и журнал этики)."""
    reset_demo(request.user)
    return Response({"ok": True, "balance": _balance(request.user)})


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf(request):
    """Выдаёт CSRF-cookie до первого POST — чтобы кнопки работали сразу."""
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "fintwin-api"})


@api_view(["GET"])
@permission_classes([AllowAny])
def service_status(request):
    """Срез мониторинга для страницы /status/: живые проверки, uptime, инциденты."""
    from core.monitoring import collect_status

    response = Response(collect_status())
    response["Cache-Control"] = "no-store"
    return response
