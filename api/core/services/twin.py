"""Цифровой двойник: обновление компетенций и рекомендации микромодулей."""
from __future__ import annotations

MAX_LEVEL = 100.0


def update_after_module(twin, module, performance: float = 0.8) -> list[dict]:
    """level += gain × (1 − level/100) × performance — убывающая отдача.

    Возвращает список изменений для интерфейса и журнала.
    """
    changes: list[dict] = []
    competencies = dict(twin.competencies or {})

    for competency, gain in (module.gains or {}).items():
        current = competencies.get(competency)
        if not isinstance(current, dict):
            current = {"level": float(current or 0), "target": 80.0}
        level = float(current.get("level", 0))
        new_level = min(MAX_LEVEL, level + float(gain) * (1 - level / MAX_LEVEL) * performance)
        competencies[competency] = {**current, "level": round(new_level, 2)}
        changes.append({"competency": competency, "before": round(level, 2), "after": round(new_level, 2)})

    twin.competencies = competencies
    completed = list(twin.completed_modules or [])
    if module.code not in completed:
        completed.append(module.code)
    twin.completed_modules = completed
    twin.save(update_fields=["competencies", "completed_modules"])
    return changes


def development_zone(twin) -> list[str]:
    zone = []
    for competency, value in (twin.competencies or {}).items():
        if not isinstance(value, dict):
            continue
        gap = float(value.get("target", 0)) - float(value.get("level", 0))
        if 10 <= gap <= 35:
            zone.append(competency)
    return zone


def rate_module(twin, module) -> float:
    """Вклад в зону развития, нормированный на минуты."""
    zone = set(development_zone(twin))
    gain = sum(value for key, value in (module.gains or {}).items() if key in zone)
    return gain / module.minutes if module.minutes else 0.0
