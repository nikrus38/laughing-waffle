"""Единичный замер для cron или systemd-таймера.

Страница /status/ пишет замеры сама, но только когда её открывают. Команда
нужна, чтобы история не прерывалась ночью и в дни без посетителей.

Пример запуска:
    python manage.py monitor_ping
"""
from django.core.management.base import BaseCommand

from core.monitoring import collect_status, prune


class Command(BaseCommand):
    help = "Проверяет компоненты, записывает замер в историю и чистит старые записи."

    def handle(self, *args, **options):
        data = collect_status()
        removed = prune()

        components = ", ".join(
            f"{item['code']}={'ok' if item['ok'] else 'fail'}" for item in data["components"]
        )
        self.stdout.write(f"{data['overall']} · {components}")
        if removed:
            self.stdout.write(f"Удалено старых замеров: {removed}")
