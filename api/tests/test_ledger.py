import pytest
from django.contrib.auth import get_user_model

from core.models import LedgerEntry
from core.services.ledger import (
    COIN_AMOUNTS,
    DAILY_LIMITS,
    GENESIS_HASH,
    LedgerError,
    award,
    verify_chain,
)

User = get_user_model()


@pytest.fixture
def student(db):
    return User.objects.create_user(username="student", password="pass12345", display_name="Тест")


@pytest.mark.django_db
def test_money_amounts_match_assignment():
    assert COIN_AMOUNTS == {
        "ai_training_data": 20,
        "data_challenge": 100,
        "mentoring": 50,
        "anomaly_report": 40,
        "market_value": 150,
        "knowledge_export": 70,
    }


@pytest.mark.django_db
def test_award_builds_valid_chain(student):
    first = award(student, "ai_training_data", "Ошибки в модуле по статистике")
    second = award(student, "data_challenge", "Data Challenge: прогноз оттока")

    assert first.prev_hash == GENESIS_HASH
    assert second.prev_hash == first.hash
    assert len(first.hash) == 64

    valid, broken = verify_chain(list(student.ledger_entries.all()))
    assert valid is True
    assert broken is None


@pytest.mark.django_db
def test_tampered_entry_breaks_chain(student):
    award(student, "ai_training_data", "Первое основание")
    award(student, "mentoring", "Второе основание")

    entry = student.ledger_entries.order_by("created_at").first()
    entry.basis = "Подменённое основание"
    entry.save(update_fields=["basis"])

    valid, broken = verify_chain(list(student.ledger_entries.all()))
    assert valid is False
    assert broken == 0


@pytest.mark.django_db
def test_duplicate_basis_rejected(student):
    award(student, "ai_training_data", "Одно и то же основание")
    with pytest.raises(LedgerError):
        award(student, "ai_training_data", "Одно и то же основание")


@pytest.mark.django_db
def test_daily_limit_enforced(student):
    limit = DAILY_LIMITS["ai_training_data"]
    for index in range(limit):
        award(student, "ai_training_data", f"Основание {index}")

    with pytest.raises(LedgerError):
        award(student, "ai_training_data", "Основание сверх лимита")

    assert student.ledger_entries.count() == limit


@pytest.mark.django_db
def test_unknown_action_rejected(student):
    with pytest.raises(LedgerError):
        award(student, "free_money", "Просто так")


@pytest.mark.django_db
def test_entries_are_isolated_per_user(student):
    other = User.objects.create_user(username="other", password="pass12345")
    award(student, "ai_training_data", "Общее основание")

    # У другого пользователя своя цепочка и своё основание
    entry = award(other, "ai_training_data", "Общее основание")
    assert entry.prev_hash == GENESIS_HASH
    assert LedgerEntry.objects.count() == 2
