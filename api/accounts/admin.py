from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Профиль демо", {"fields": ("display_name", "course", "role")}),
    )
    list_display = ("username", "display_name", "course", "role", "is_staff")
    list_filter = ("role", "course", "is_staff")
