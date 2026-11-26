from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Пользователь демо. Telegram-данные не сохраняются (см. решения проекта)."""

    class Role(models.TextChoices):
        STUDENT = "student", "Студент"
        PARTNER = "partner", "Партнёр и кафедра"

    display_name = models.CharField("Имя в интерфейсе", max_length=120, blank=True)
    course = models.PositiveSmallIntegerField(
        "Курс", choices=[(1, "1 курс"), (2, "2 курс"), (3, "3 курс"), (4, "4 курс")], default=1
    )
    role = models.CharField("Роль", max_length=16, choices=Role.choices, default=Role.STUDENT)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self) -> str:
        return self.display_name or self.username

    @property
    def initials(self) -> str:
        source = self.display_name or self.username
        parts = [part for part in source.split() if part]
        return "".join(part[0].upper() for part in parts[:2]) or "ФТ"
