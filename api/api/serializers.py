"""Преобразование моделей в JSON для фронтенда (camelCase, как в React-типах)."""
from __future__ import annotations

from django.utils import timezone

from core.services.matching import MatchResult


def user_payload(user) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "displayName": user.display_name or user.username,
        "initials": user.initials,
        "course": user.course,
        "role": user.role,
        "organization": user.organization,
        "position": user.position,
        "isMock": True,
    }


def twin_payload(twin) -> dict:
    return {
        "competencies": twin.competencies,
        "interests": twin.interests,
        "weeklyHours": twin.weekly_hours,
        "completedModules": twin.completed_modules,
    }


def module_payload(module, completed: set[str] | None = None) -> dict:
    return {
        "id": module.code,
        "title": module.title,
        "minutes": module.minutes,
        "difficulty": module.difficulty,
        "kind": module.kind,
        "gains": module.gains,
        "valueTags": module.value_codes,
        "isCompleted": bool(completed and module.code in completed),
        "isMock": True,
    }


def task_payload(task, match: MatchResult) -> dict:
    return {
        "id": task.code,
        "title": task.title,
        "partnerLabel": task.partner_label,
        "summary": task.summary,
        "required": task.required,
        "difficulty": task.difficulty,
        "weeks": task.weeks,
        "tags": task.tags,
        "status": task.status,
        "isMock": task.is_mock,
        "match": match.as_dict(),
    }


def partner_task_payload(task) -> dict:
    """Задача глазами автора: без матчинга, зато со счётчиком откликов."""
    return {
        "id": task.code,
        "title": task.title,
        "summary": task.summary,
        "partnerLabel": task.partner_label,
        "required": task.required,
        "difficulty": task.difficulty,
        "weeks": task.weeks,
        "tags": task.tags,
        "status": task.status,
        "applicationsCount": task.applications.count(),
        "createdAt": timezone.localtime(task.created_at).strftime("%d.%m.%Y"),
        "isMock": task.is_mock,
    }


def application_payload(application, match: float | None = None) -> dict:
    return {
        "id": application.id,
        "student": application.user.display_name or application.user.username,
        "initials": application.user.initials,
        "course": application.user.course,
        "taskId": application.task.code,
        "taskTitle": application.task.title,
        "status": application.status,
        "createdAt": timezone.localtime(application.created_at).strftime("%d.%m %H:%M"),
        "match": round(match, 1) if match is not None else None,
    }


def ledger_payload(entry) -> dict:
    return {
        "id": entry.id,
        "ts": int(entry.created_at.timestamp() * 1000),
        "action": entry.action,
        "amount": entry.amount,
        "basis": entry.basis,
        "valueIds": entry.value_codes,
        "prevHash": entry.prev_hash,
        "hash": entry.hash,
    }


def ethics_payload(decision) -> dict:
    return {
        "id": decision.id,
        "ts": int(decision.created_at.timestamp() * 1000),
        "module": decision.module,
        "ruleId": decision.rule_id,
        "summary": decision.summary,
        "considered": decision.considered,
        "rejected": decision.rejected,
        "chosen": decision.chosen,
        "valueIds": decision.value_codes,
        "isMock": decision.is_mock,
    }


def value_payload(value) -> dict:
    return {
        "id": value.code,
        "name": value.name,
        "text": value.official_text,
    }


def rule_payload(rule) -> dict:
    return {
        "id": rule.code,
        "valueId": rule.value.code,
        "module": rule.module,
        "title": rule.title,
        "algorithm": rule.algorithm,
        "without": rule.without,
        "with": rule.with_example,
    }


def barrier_payload(barrier) -> dict:
    return {
        "id": barrier.code,
        "category": barrier.category,
        "title": barrier.title,
        "stage": barrier.stage,
        "severity": barrier.severity,
        "solvedBy": barrier.solved_by,
        "note": barrier.note,
        "isMock": barrier.is_mock,
    }
