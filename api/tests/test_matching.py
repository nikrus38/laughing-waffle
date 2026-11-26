import pytest

from core.services.matching import (
    WEIGHTS,
    calculate_match,
    growth_fit,
    interest_fit,
    is_stretch_task,
    load_fit,
    skill_fit,
)


class FakeTwin:
    competencies = {
        "data": {"level": 50, "target": 80},
        "finance": {"level": 70, "target": 85},
        "research": {"level": 20, "target": 60},
    }
    interests = ["аналитика", "финансы"]
    weekly_hours = 20


class FakeTask:
    def __init__(self, required, difficulty=3, tags=None, title="Тестовая задача"):
        self.required = required
        self.difficulty = difficulty
        self.tags = tags or ["аналитика"]
        self.title = title


def test_weights_sum_to_one():
    assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


def test_skill_fit_is_capped_at_one():
    assert skill_fit({"data": {"level": 120}}, {"data": 60}) == 1.0


def test_skill_fit_zero_without_competencies():
    assert skill_fit({}, {"data": 60}) == 0.0


def test_growth_fit_zone():
    # разрыв 30 (вне зоны), 10 (в зоне), 40 (вне зоны)
    value = growth_fit(
        {"data": {"level": 30}, "finance": {"level": 60}, "research": {"level": 20}},
        {"data": 60, "finance": 70, "research": 60},
    )
    assert value == pytest.approx(1 / 3, rel=1e-3)


def test_interest_fit_jaccard():
    assert interest_fit(["аналитика", "финансы"], ["финансы", "право"]) == pytest.approx(1 / 3)
    assert interest_fit([], ["финансы"]) == 0.0


def test_load_fit():
    assert load_fit(20, 1) == 1.0
    assert load_fit(2, 5) == pytest.approx(0.2)


def test_stretch_detection():
    assert is_stretch_task({"data": {"level": 10}}, {"data": 60}, difficulty=2) is True
    assert is_stretch_task({"data": {"level": 55}}, {"data": 60}, difficulty=2) is False


def test_calculate_match_returns_explainable_factors():
    task = FakeTask({"data": 60, "finance": 75}, difficulty=3)
    result = calculate_match(FakeTwin(), task)

    assert 0 <= result.score <= 100
    assert {factor["key"] for factor in result.factors} == {"skill", "growth", "interest", "load"}
    assert abs(sum(factor["weight"] for factor in result.factors) - 1.0) < 1e-9
    assert "средний балл" in result.explanation or "вырост" in result.explanation
