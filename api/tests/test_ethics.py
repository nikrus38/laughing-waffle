from core.services.ethics import ensure_stretch_in_top3


def make(task_id, score, stretch=False):
    return {"taskId": task_id, "title": f"Задача {task_id}", "score": score, "isStretch": stretch}


def test_rule_keeps_all_items_without_duplicates():
    matches = [make("a", 90), make("b", 80), make("c", 70), make("stretch", 40, True)]

    ordered, decision = ensure_stretch_in_top3(matches)

    assert len(ordered) == len(matches)
    assert {item["taskId"] for item in ordered} == {"a", "b", "c", "stretch"}
    assert any(item["isStretch"] for item in ordered[:3])
    assert decision is not None
    assert decision["ruleId"] == "MATCH-001"


def test_rule_noop_when_stretch_already_in_top3():
    matches = [make("a", 90, True), make("b", 80), make("c", 70)]

    ordered, decision = ensure_stretch_in_top3(matches)

    assert [item["taskId"] for item in ordered] == ["a", "b", "c"]
    assert decision is None


def test_rule_noop_when_no_stretch_exists():
    matches = [make("a", 90), make("b", 80), make("c", 70)]

    ordered, decision = ensure_stretch_in_top3(matches)

    assert len(ordered) == 3
    assert decision is None
