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
    TaskApplication,
    Twin,
    Value,
)
from core.services.demo import seed_applications_for, seed_ethics_for, seed_ledger_for


class Command(BaseCommand):
    help = "Создаёт демо-данные и демо-пользователя (MOCK)."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Пересоздать реестр и журнал демо-студента")

    def handle(self, *args, **options):
        self.seed_catalog()
        student = self.seed_persona(seed_data.DEMO_STUDENT, User.Role.STUDENT)
        partner = self.seed_persona(seed_data.DEMO_PARTNER, User.Role.PARTNER)

        # Демо-задачи принадлежат партнёру: его кабинет должен быть не пустым.
        PartnerTask.objects.filter(owner__isnull=True).update(owner=partner)

        if options["reset"] or not student.ledger_entries.exists():
            self.seed_ledger(student)
        if options["reset"] or not student.ethics_decisions.exists():
            self.seed_ethics(student)
        if options["reset"] or not TaskApplication.objects.filter(task__owner=partner).exists():
            self.seed_applications(student, partner)
        self.seed_applicants(partner)
        self.stdout.write(self.style.SUCCESS("Демо-данные готовы."))
        self.stdout.write(
            f"  Студент: {seed_data.DEMO_STUDENT['username']} / {seed_data.DEMO_STUDENT['password']}"
        )
        self.stdout.write(
            f"  Партнёр: {seed_data.DEMO_PARTNER['username']} / {seed_data.DEMO_PARTNER['password']}"
        )
        self.stdout.write(f"  Профиль партнёра: {partner.display_name}")
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

    def seed_persona(self, data: dict, role: str) -> User:
        """Создаёт демо-персону: отдельного пользователя со своим двойником."""
        person, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "display_name": data["display_name"],
                "course": data["course"],
                "email": f"{data['username']}@example.invalid",
                "role": role,
            },
        )
        if created:
            person.set_password(data["password"])
            person.save(update_fields=["password"])
        else:
            person.display_name = person.display_name or data["display_name"]
            person.role = role
            person.save(update_fields=["display_name", "role"])

        Twin.objects.update_or_create(
            user=person,
            defaults={
                "competencies": data["competencies"],
                "interests": data["interests"],
                "weekly_hours": data["weekly_hours"],
                "completed_modules": data["completed_modules"],
                "is_mock": True,
            },
        )

        if role == User.Role.PARTNER:
            # Партнёр не зарабатывает FinCoin: записи из старых версий демо удаляем.
            person.ledger_entries.all().delete()
            person.ethics_decisions.all().delete()
            person.applications.all().delete()

        return person

    def seed_ledger(self, student: User):
        seed_ledger_for(student)

    def seed_ethics(self, student: User):
        seed_ethics_for(student)

    def seed_applications(self, student: User, partner: User):
        seed_applications_for(student, partner)

    def seed_applicants(self, partner: User):
        """Три соискателя для воронки партнёра. Войти под ними нельзя: пароль непригоден."""
        for item in seed_data.DEMO_APPLICANTS:
            applicant, created = User.objects.get_or_create(
                username=item["username"],
                defaults={
                    "display_name": item["display_name"],
                    "course": item["course"],
                    "role": User.Role.STUDENT,
                    "email": f"{item['username']}@example.invalid",
                },
            )
            if created:
                applicant.set_unusable_password()
                applicant.save(update_fields=["password"])

            Twin.objects.update_or_create(
                user=applicant,
                defaults={
                    "competencies": item["competencies"],
                    "interests": item["interests"],
                    "weekly_hours": 12,
                    "completed_modules": [],
                    "is_mock": True,
                },
            )

            task = PartnerTask.objects.filter(code=item["task"], owner=partner).first()
            if task is not None:
                TaskApplication.objects.get_or_create(
                    user=applicant,
                    task=task,
                    defaults={"status": item["status"]},
                )
