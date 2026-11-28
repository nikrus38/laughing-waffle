from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Пользователи демо: студент и партнёр — разные аккаунты."""

    list_display = ("username", "display_name", "course", "role", "balance_column", "is_staff")
    list_filter = ("role", "course", "is_staff", "is_active")
    search_fields = ("username", "display_name", "email")
    ordering = ("username",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Профиль демо", {"fields": ("display_name", "course", "role")}),
    )

    @admin.display(description="FinCoin")
    def balance_column(self, obj: User) -> str:
        total = sum(entry.amount for entry in obj.ledger_entries.all())
        return format_html("<b>{}</b>", total)
