"""Реестр FinCoin: суммы, лимиты, цепочка хэшей SHA-256.

Правила:
- суммы строго из задания;
- одно основание нельзя засчитать дважды (на пользователя);
- дневные лимиты по типу действия;
- hash = sha256(prev_hash | entry_id | ts | action | amount | basis);
- первая запись ссылается на 64 нуля.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, time, timedelta

from django.db import transaction
from django.utils import timezone

GENESIS_HASH = "0" * 64

COIN_AMOUNTS = {
    "ai_training_data": 20,
    "data_challenge": 100,
    "mentoring": 50,
    "anomaly_report": 40,
    "market_value": 150,
    "knowledge_export": 70,
}

DAILY_LIMITS = {
    "ai_training_data": 3,
    "data_challenge": 1,
    "mentoring": 2,
    "anomaly_report": 2,
    "market_value": 1,
    "knowledge_export": 1,
}


class LedgerError(Exception):
    """Начисление отклонено правилом реестра."""


def calculate_hash(prev_hash: str, entry_id: int, ts: datetime, action: str, amount: int, basis: str) -> str:
    payload = f"{prev_hash}|{entry_id}|{int(ts.timestamp())}|{action}|{amount}|{basis}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def last_hash(user) -> str:
    entry = user.ledger_entries.order_by("-created_at", "-id").first()
    return entry.hash if entry else GENESIS_HASH


def entries_today(user, action: str, now: datetime | None = None) -> int:
    now = now or timezone.now()
    start = timezone.make_aware(datetime.combine(now.date(), time.min), now.tzinfo)
    end = start + timedelta(days=1)
    return user.ledger_entries.filter(action=action, created_at__gte=start, created_at__lt=end).count()


def award(user, action: str, basis: str, value_codes: list[str] | None = None):
    """Создаёт запись реестра или поднимает LedgerError с понятной причиной."""
    from core.models import LedgerEntry

    if action not in COIN_AMOUNTS:
        raise LedgerError("Неизвестный тип действия.")

    basis = (basis or "").strip()
    if not basis:
        raise LedgerError("Не указано основание начисления.")

    if user.ledger_entries.filter(basis=basis).exists():
        raise LedgerError("Это основание уже засчитано — дубли отклоняются (правило LEDGER-001).")

    if entries_today(user, action) >= DAILY_LIMITS[action]:
        raise LedgerError("Достигнут дневной лимит по этому типу действия.")

    with transaction.atomic():
        prev = last_hash(user)
        ts = timezone.now()
        amount = COIN_AMOUNTS[action]
        # id нужен для хэша: сначала создаём черновик, затем фиксируем хэш
        entry = LedgerEntry.objects.create(
            user=user,
            created_at=ts,
            action=action,
            amount=amount,
            basis=basis,
            value_codes=value_codes or [],
            prev_hash=prev,
            hash="",
        )
        entry.hash = calculate_hash(prev, entry.id, ts, action, amount, basis)
        entry.save(update_fields=["hash"])

    return entry


def verify_chain(entries) -> tuple[bool, int | None]:
    """Проверяет цепочку. Возвращает (валидна ли, индекс первой поломки)."""
    previous = GENESIS_HASH
    for index, entry in enumerate(entries):
        if entry.prev_hash != previous:
            return False, index
        expected = calculate_hash(entry.prev_hash, entry.id, entry.created_at, entry.action, entry.amount, entry.basis)
        if entry.hash != expected:
            return False, index
        previous = entry.hash
    return True, None
