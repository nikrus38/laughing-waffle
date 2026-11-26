"""Заполнение базы демонстрационными данными.

Использование:
    .venv\\Scripts\\python api\\manage.py seed_demo
    .venv\\Scripts\\python api\\manage.py seed_demo --reset
"""
from django.core.management.base import BaseCommand

from accounts.models import User
from core import seed_data
from core.models import (
    Barrier,
    EthicsRule,
    Micromodule,
    PartnerTask,
    Twin,
    Value,
)
from core.services.demo import seed_ethics_for, seed_ledger_for


class Command(BaseCommand):
    help = "Создаёт демо-данные и демо-пользователя (MOCK)."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Пересоздать реестр и журнал демо-студента")

    def handle(self, *args, **options):
        self.seed_catalog()
        student = self.seed_student()
        if options["reset"] or not student.ledger_entries.exists():
            self.seed_ledger(student)
        if options["reset"] or not student.ethics_decisions.exists():
            self.seed_ethics(student)

        self.stdout.write(self.style.SUCCESS("Демо-данные готовы."))
        self.stdout.write(f"  Студент: {seed_data.DEMO_STUDENT['username']} / {seed_data.DEMO_STUDENT['password']}")
        self.stdout.write("  Лендинг: /   Консоль: /app/   Админка: /admin/")

    def seed_catalog(self):
        for order, (code, name) in enumerate(seed_data.VALUES):
            Value.objects.update_or_create(
                code=code,
                defaults={"name": name, "official_text": None, "order": order},
            )

        for rule in seed_data.RULES:
            EthicsRule.objects.update_or_create(
                code=rule["code"],
                defaults={
                    "value": Value.objects.get(code=rule["value"]),
                    "module": rule["module"],
                    "title": rule["title"],
                    "algorithm": rule["algorithm"],
                    "without": rule["without"],
                    "with_example": rule["with_example"],
                },
            )

        for code, title, minutes, difficulty, kind, gains, values in seed_data.MODULES:
            Micromodule.objects.update_or_create(
                code=code,
                defaults={
                    "title": title,
                    "minutes": minutes,
                    "difficulty": difficulty,
                    "kind": kind,
                    "gains": gains,
                    "value_codes": values,
                    "is_mock": True,
                },
            )

        for code, title, partner, summary, required, difficulty, weeks, tags in seed_data.TASKS:
            PartnerTask.objects.update_or_create(
                code=code,
                defaults={
                    "title": title,
                    "partner_label": partner,
                    "summary": summary,
                    "required": required,
                    "difficulty": difficulty,
                    "weeks": weeks,
                    "tags": tags,
                    "is_mock": True,
                },
            )

        for code, category, title, stage, severity, solved_by, note in seed_data.BARRIERS:
            Barrier.objects.update_or_create(
                code=code,
                defaults={
                    "category": category,
                    "title": title,
                    "stage": stage,
                    "severity": severity,
                    "solved_by": solved_by,
                    "note": f"Оценка команды, не результат исследования. {note}",
                    "is_mock": True,
                },
            )

    def seed_student(self) -> User:
        data = seed_data.DEMO_STUDENT
        student, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "display_name": data["display_name"],
                "course": data["course"],
                "email": "demo@example.invalid",
                "role": User.Role.STUDENT,
            },
        )
        if created:
            student.set_password(data["password"])
            student.save(update_fields=["password"])
        else:
            student.display_name = student.display_name or data["display_name"]
            student.save(update_fields=["display_name"])

        Twin.objects.update_or_create(
            user=student,
            defaults={
                "competencies": data["competencies"],
                "interests": data["interests"],
                "weekly_hours": data["weekly_hours"],
                "completed_modules": data["completed_modules"],
                "is_mock": True,
            },
        )
        return student

    def seed_ledger(self, student: User):
        seed_ledger_for(student)

    def seed_ethics(self, student: User):
        seed_ethics_for(student)
