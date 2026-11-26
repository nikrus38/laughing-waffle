"""Матчинг «ИИ-сват».

Формула из проектной документации, без скрытых признаков:
score = 100 × (0,40·skillFit + 0,30·growthFit + 0,20·interestFit + 0,10·loadFit)
"""
from __future__ import annotations

from dataclasses import dataclass

WEIGHTS = {"skill": 0.40, "growth": 0.30, "interest": 0.20, "load": 0.10}

FACTOR_LABELS = {
    "skill": "Покрытие требований",
    "growth": "Зона ближайшего развития",
    "interest": "Совпадение интересов",
    "load": "Помещается в свободные часы",
}

# Сколько часов в неделю примерно требует задача данной сложности
HOURS_PER_DIFFICULTY = 2


@dataclass(frozen=True)
class MatchResult:
    score: int
    factors: list[dict]
    is_stretch: bool
    explanation: str

    def as_dict(self) -> dict:
        return {
            "score": self.score,
            "factors": self.factors,
            "isStretch": self.is_stretch,
            "explanation": self.explanation,
        }


def _level(twin_competencies: dict, competency: str) -> float:
    value = twin_competencies.get(competency)
    if isinstance(value, dict):
        return float(value.get("level", 0))
    if isinstance(value, (int, float)):
        return float(value)
    return 0.0


def skill_fit(competencies: dict, required: dict) -> float:
    if not required:
        return 1.0
    total_weight = sum(required.values()) or 1
    covered = 0.0
    for competency, needed in required.items():
        if needed <= 0:
            continue
        level = _level(competencies, competency)
        covered += (needed / total_weight) * min(level / needed, 1.0)
    return max(0.0, min(1.0, covered))


def growth_fit(competencies: dict, required: dict) -> float:
    """Доля требований, где разрыв 5–25 пунктов — зона ближайшего развития."""
    if not required:
        return 0.5
    in_zone = 0
    for competency, needed in required.items():
        gap = needed - _level(competencies, competency)
        if 5 <= gap <= 25:
            in_zone += 1
    return in_zone / len(required)


def interest_fit(interests: list[str], tags: list[str]) -> float:
    left = {item.strip().lower() for item in interests if item}
    right = {item.strip().lower() for item in tags if item}
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def load_fit(weekly_hours: int, difficulty: int) -> float:
    needed = max(1, difficulty * HOURS_PER_DIFFICULTY)
    return max(0.0, min(1.0, weekly_hours / needed))


def is_stretch_task(competencies: dict, required: dict, difficulty: int) -> bool:
    """Задача на вырост: разрыв больше 25 пунктов или высокая сложность при слабом покрытии."""
    for competency, needed in required.items():
        if needed - _level(competencies, competency) > 25:
            return True
    return difficulty >= 4 and skill_fit(competencies, required) < 0.6


def calculate_match(twin, task) -> MatchResult:
    skills = skill_fit(twin.competencies, task.required)
    growth = growth_fit(twin.competencies, task.required)
    interest = interest_fit(twin.interests, task.tags)
    load = load_fit(twin.weekly_hours, task.difficulty)

    score = round(
        100
        * (
            WEIGHTS["skill"] * skills
            + WEIGHTS["growth"] * growth
            + WEIGHTS["interest"] * interest
            + WEIGHTS["load"] * load
        )
    )

    factors = [
        {"key": "skill", "label": FACTOR_LABELS["skill"], "weight": WEIGHTS["skill"], "value": round(skills, 2)},
        {"key": "growth", "label": FACTOR_LABELS["growth"], "weight": WEIGHTS["growth"], "value": round(growth, 2)},
        {"key": "interest", "label": FACTOR_LABELS["interest"], "weight": WEIGHTS["interest"], "value": round(interest, 2)},
        {"key": "load", "label": FACTOR_LABELS["load"], "weight": WEIGHTS["load"], "value": round(load, 2)},
    ]

    stretch = is_stretch_task(twin.competencies, task.required, task.difficulty)

    if stretch:
        explanation = (
            "Задача попала в рекомендации как задача на вырост: по одной из компетенций "
            "разрыв больше 25 пунктов. Это управляемый вызов, а не ошибка подбора."
        )
    else:
        explanation = (
            "Задача подобрана по покрытию требований и зоне ближайшего развития. "
            "Пол, возраст, происхождение и средний балл в расчёте не участвуют."
        )

    return MatchResult(score=score, factors=factors, is_stretch=stretch, explanation=explanation)
