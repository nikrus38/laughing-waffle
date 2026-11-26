"""Демо-сценарии: стартовый реестр и журнал этики для пользователя."""
from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from core import seed_data
from core.models import EthicsDecision, LedgerEntry
from core.services.ledger import COIN_AMOUNTS, GENESIS_HASH, calculate_hash


def seed_ledger_for(user) -> None:
    LedgerEntry.objects.filter(user=user).delete()
    previous = GENESIS_HASH
    now = timezone.now()
    for action, basis, value_codes, days_ago in seed_data.STARTER_LEDGER:
        ts = now - timedelta(days=days_ago)
        entry = LedgerEntry.objects.create(
            user=user,
            created_at=ts,
            action=action,
            amount=COIN_AMOUNTS[action],
            basis=basis,
            value_codes=value_codes,
            prev_hash=previous,
            hash="",
        )
        entry.hash = calculate_hash(previous, entry.id, ts, action, entry.amount, basis)
        entry.save(update_fields=["hash"])
        previous = entry.hash


def seed_ethics_for(user) -> None:
    EthicsDecision.objects.filter(user=user).delete()
    now = timezone.now()
    for item in seed_data.STARTER_ETHICS:
        EthicsDecision.objects.create(
            user=user,
            created_at=now - timedelta(hours=item["hours_ago"]),
            module=item["module"],
            rule_id=item["rule_id"],
            summary=item["summary"],
            considered=item["considered"],
            rejected=item["rejected"],
            chosen=item["chosen"],
            value_codes=item["value_codes"],
            is_mock=True,
        )


def reset_demo(user) -> None:
    seed_ledger_for(user)
    seed_ethics_for(user)
