"""Этический фильтр: правила и их применение.

Правила хранятся как данные (модель EthicsRule), код проверки — здесь.
Каждое срабатывание оставляет запись в журнале решений.
"""
from __future__ import annotations

from core.models import EthicsRule


def rule_for(code: str) -> EthicsRule | None:
    return EthicsRule.objects.filter(code=code).select_related("value").first()


def ensure_stretch_in_top3(matches: list[dict]):
    """MATCH-001 → «Стремление к совершенству».

    В первой тройке рекомендаций всегда есть задача на вырост.
    Если все три лёгкие, самая слабая вытесняется лучшей из трудных.

    matches: [{taskId, title, isStretch, score}]
    Возвращает (переупорядоченный список, запись решения или None).
    """
    ordered = sorted(matches, key=lambda item: item["score"], reverse=True)
    top3 = ordered[:3]

    if any(item["isStretch"] for item in top3):
        return ordered, None

    stretch = next((item for item in ordered if item["isStretch"]), None)
    if stretch is None:
        return ordered, None

    displaced = top3[-1]
    rest = [item for item in ordered if item["taskId"] != stretch["taskId"]]
    position = min(2, len(rest))
    rest.insert(position, stretch)

    decision = {
        "module": "matcher",
        "ruleId": "MATCH-001",
        "summary": "В первую тройку добавлена задача на вырост",
        "considered": [{"id": item["taskId"], "label": item["title"]} for item in top3],
        "rejected": [
            {
                "id": displaced["taskId"],
                "reason": "Все три задачи были лёгкими — самая простая вытеснена",
                "valueId": "excellence",
            }
        ],
        "chosen": stretch["taskId"],
        "valueIds": ["excellence"],
    }
    return rest, decision


def memory_rule(values: list[str]) -> str:
    """Правило-подсказка для интерфейса, если ценность ещё не описана."""
    return "Правило появится после согласования официального перечня ценностей."
