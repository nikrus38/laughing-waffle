"""Мониторинг доступности: живые проверки, история замеров и инциденты.

Принцип честности: история начинается с первого настоящего замера.
Дни без данных показываются как «нет данных», а не как 100% uptime.
"""
from __future__ import annotations

import datetime as dt
import time
from pathlib import Path

from django.conf import settings
from django.db import connection
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from core.models import Incident, StatusSample

# Один замер в минуту: чаще нет смысла, а база не растёт зря.
CHECK_INTERVAL_SECONDS = 60
HISTORY_DAYS = 30
LATENCY_POINTS = 40

COMPONENTS = [
    ("api", "API", "REST-эндпоинты /api/*"),
    ("database", "База данных", "чтение и запись"),
    ("ledger", "Реестр FinCoin", "проверка цепочки SHA-256"),
    ("web", "Сайт и PWA", "шаблоны, статика, оболочка консоли"),
]

STATE_LABELS = {
    "operational": "Все системы работают",
    "degraded": "Часть систем отвечает с ошибками",
    "outage": "Сервис недоступен",
}


def _timed(check) -> tuple[bool, int, str]:
    """Выполняет проверку и возвращает (успех, миллисекунды, текст ошибки)."""
    started = time.perf_counter()
    ok = True
    detail = ""
    try:
        check()
    except Exception as exc:  # noqa: BLE001 — статус должен выжить при любой ошибке проверки
        ok = False
        detail = f"{exc.__class__.__name__}: {exc}"[:200]
    return ok, int((time.perf_counter() - started) * 1000), detail


def _check_api() -> None:
    """Если этот код выполнился, HTTP-слой уже ответил на запрос."""
    return None


def _check_database() -> None:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()


def _check_ledger() -> None:
    """Проверяем цепочку демо-студента: она должна быть целой."""
    from accounts.models import User
    from core.services.ledger import verify_chain

    user = User.objects.filter(username="demo").first()
    if user is None:
        return
    entries = list(user.ledger_entries.order_by("id"))
    valid, broken_at = verify_chain(entries)
    if not valid:
        raise ValueError(f"цепочка повреждена на записи {broken_at}")


def _check_web() -> None:
    index = Path(settings.FRONTEND_DIST) / "index.html"
    if not index.is_file():
        raise FileNotFoundError("не собран фронтенд консоли")


_CHECKS = {
    "api": _check_api,
    "database": _check_database,
    "ledger": _check_ledger,
    "web": _check_web,
}


def run_checks() -> list[dict]:
    """Живые проверки всех компонентов. Ничего не записывает."""
    results = []
    for code, name, description in COMPONENTS:
        ok, latency_ms, detail = _timed(_CHECKS[code])
        results.append(
            {
                "code": code,
                "name": name,
                "description": description,
                "ok": ok,
                "latencyMs": latency_ms,
                "detail": detail,
            }
        )
    return results


def _record(results: list[dict]) -> bool:
    """Пишет замер в историю, но не чаще раза в минуту."""
    now = timezone.now()
    last = StatusSample.objects.order_by("-created_at").values_list("created_at", flat=True).first()
    if last and (now - last).total_seconds() < CHECK_INTERVAL_SECONDS:
        return False
    StatusSample.objects.bulk_create(
        [
            StatusSample(
                component=item["code"],
                ok=item["ok"],
                latency_ms=min(item["latencyMs"], 60000),
                created_at=now,
            )
            for item in results
        ]
    )
    return True


def _window(days: int):
    today = timezone.localdate()
    start = today - dt.timedelta(days=days - 1)
    since = timezone.make_aware(
        dt.datetime.combine(start, dt.time.min),
        timezone.get_current_timezone(),
    )
    return start, since


def _series(by_day: dict, days: int, start) -> list[dict]:
    series = []
    for offset in range(days):
        day = start + dt.timedelta(days=offset)
        row = by_day.get(day)
        total = row["total"] if row else 0
        ok_count = row["ok_count"] if row else 0
        series.append(
            {
                "date": day.isoformat(),
                "label": day.strftime("%d.%m"),
                "total": total,
                "ok": ok_count,
                "uptime": round(ok_count / total * 100, 2) if total else None,
                "latencyMs": round(row["latency"]) if total else None,
            }
        )
    return series


def _daily(days: int, component: str | None = None) -> dict:
    start, since = _window(days)
    queryset = StatusSample.objects.filter(created_at__gte=since)
    if component:
        queryset = queryset.filter(component=component)
    rows = (
        queryset.annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(
            total=Count("id"),
            ok_count=Count("id", filter=Q(ok=True)),
            latency=Avg("latency_ms"),
        )
        .order_by("day")
    )
    return {row["day"]: row for row in rows}


def history(days: int = HISTORY_DAYS) -> list[dict]:
    """Дневная история доступности. Дни без замеров отдаём с uptime = None."""
    start, _ = _window(days)
    return _series(_daily(days), days, start)


def component_history(days: int = HISTORY_DAYS) -> dict[str, list[dict]]:
    """Та же история, но отдельно по компонентам: у каждой строки свой график."""
    start, since = _window(days)
    rows = (
        StatusSample.objects.filter(created_at__gte=since)
        .annotate(day=TruncDate("created_at"))
        .values("component", "day")
        .annotate(
            total=Count("id"),
            ok_count=Count("id", filter=Q(ok=True)),
            latency=Avg("latency_ms"),
        )
        .order_by("component", "day")
    )

    buckets: dict[str, dict] = {}
    for row in rows:
        buckets.setdefault(row["component"], {})[row["day"]] = row
    return {
        code: _series(buckets.get(code, {}), days, start)
        for code, _name, _description in COMPONENTS
    }


def latency_points(limit: int = LATENCY_POINTS) -> list[dict]:
    """Последние замеры API для мини-графика времени ответа."""
    rows = StatusSample.objects.filter(component="api").order_by("-created_at")[:limit]
    points = [
        {
            "ts": timezone.localtime(row.created_at).strftime("%H:%M"),
            "latencyMs": row.latency_ms,
            "ok": row.ok,
        }
        for row in reversed(list(rows))
    ]
    peak = max((point["latencyMs"] for point in points), default=0) or 1
    for point in points:
        # Высота столбика в процентах: минимум 6%, чтобы короткие ответы были видны.
        point["height"] = max(6, round(point["latencyMs"] / peak * 100))
    return points


def summary(series: list[dict]) -> dict:
    measured = [day for day in series if day["total"]]
    total = sum(day["total"] for day in measured)
    ok_count = sum(day["ok"] for day in measured)
    latencies = [day["latencyMs"] for day in measured if day["latencyMs"] is not None]
    return {
        "days": len(measured),
        "checks": total,
        "uptime": round(ok_count / total * 100, 2) if total else None,
        "avgLatencyMs": round(sum(latencies) / len(latencies)) if latencies else None,
        "since": measured[0]["date"] if measured else None,
    }


def prune(keep_days: int = HISTORY_DAYS * 3) -> int:
    """Удаляет старые замеры, чтобы таблица не росла бесконечно. Возвращает число строк."""
    border = timezone.now() - dt.timedelta(days=keep_days)
    deleted, _ = StatusSample.objects.filter(created_at__lt=border).delete()
    return deleted


def recent_incidents(limit: int = 8) -> list[dict]:
    items = []
    for incident in Incident.objects.all()[:limit]:
        items.append(
            {
                "id": incident.id,
                "title": incident.title,
                "summary": incident.summary,
                "severity": incident.get_severity_display(),
                "component": incident.component,
                "startedAt": timezone.localtime(incident.started_at).strftime("%d.%m.%Y %H:%M"),
                "resolvedAt": (
                    timezone.localtime(incident.resolved_at).strftime("%d.%m.%Y %H:%M")
                    if incident.resolved_at
                    else None
                ),
                "isOpen": incident.is_open,
            }
        )
    return items


def collect_status(record: bool = True, days: int = HISTORY_DAYS) -> dict:
    """Собирает полный срез для страницы статуса и JSON-эндпоинта."""
    checks = run_checks()
    recorded = _record(checks) if record else False
    series = history(days)
    stats = summary(series)
    by_component = component_history(days)

    for item in checks:
        own = by_component.get(item["code"], [])
        item["days"] = own
        item["uptime"] = summary(own)["uptime"]

    failed = [item for item in checks if not item["ok"]]
    if not failed:
        overall = "operational"
    elif len(failed) == len(checks):
        overall = "outage"
    else:
        overall = "degraded"

    return {
        "generatedAt": timezone.localtime().isoformat(timespec="seconds"),
        "overall": overall,
        "overallLabel": STATE_LABELS[overall],
        "components": checks,
        "uptime": stats,
        "days": series,
        "latency": latency_points(),
        "incidents": recent_incidents(),
        "recorded": recorded,
        "monitoring": {
            "intervalSeconds": CHECK_INTERVAL_SECONDS,
            "historyDays": days,
            "dataVersion": "real",
        },
    }
