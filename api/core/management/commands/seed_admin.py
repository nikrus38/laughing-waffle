"""Создание суперпользователя для админки демо-стенда.

Пароль берётся из ADMIN_PASSWORD, чтобы не хранить его в репозитории.
    python manage.py seed_admin --username admin --password '...'
"""
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Создаёт или обновляет суперпользователя для админки."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.environ.get("ADMIN_USERNAME", "admin"))
        parser.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD", ""))
        parser.add_argument("--email", default=os.environ.get("ADMIN_EMAIL", "admin@example.invalid"))

    def handle(self, *args, **options):
        username = options["username"].strip()
        password = options["password"]
        email = options["email"]

        if not username or not password:
            self.stderr.write(
                "Не задан логин или пароль: передайте --password или переменную ADMIN_PASSWORD."
            )
            return

        User = get_user_model()
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "display_name": "Администратор демо"},
        )
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        action = "создан" if created else "обновлён"
        self.stdout.write(self.style.SUCCESS(f"Администратор {username} {action}."))
