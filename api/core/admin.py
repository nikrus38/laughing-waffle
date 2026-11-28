from django.contrib import admin
from django.utils import timezone

from .models import (
    Barrier,
    EthicsDecision,
    EthicsRule,
    Incident,
    LedgerEntry,
    Micromodule,
    PartnerTask,
    StatusSample,
    TaskApplication,
    Twin,
    Value,
)


@admin.register(Value)
class ValueAdmin(admin.ModelAdmin):
    list_display = ("order", "code", "name", "has_text")
    list_editable = ("name",)
    search_fields = ("code", "name")
    ordering = ("order",)

    @admin.display(description="Официальный текст", boolean=True)
    def has_text(self, obj: Value) -> bool:
        return bool(obj.official_text)


@admin.register(EthicsRule)
class EthicsRuleAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "module", "value")
    list_filter = ("module", "value")
    search_fields = ("code", "title", "algorithm")


@admin.register(Micromodule)
class MicromoduleAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "minutes", "difficulty", "kind")
    list_filter = ("kind", "difficulty")
    search_fields = ("code", "title")


class TaskApplicationInline(admin.TabularInline):
    model = TaskApplication
    extra = 0
    fields = ("user", "created_at")
    readonly_fields = ("created_at",)
    verbose_name = "Отклик студента"
    verbose_name_plural = "Отклики студентов"


@admin.register(PartnerTask)
class PartnerTaskAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "partner_label", "difficulty", "weeks", "applications_count")
    list_filter = ("difficulty",)
    search_fields = ("code", "title", "partner_label", "summary")
    inlines = (TaskApplicationInline,)

    @admin.display(description="Откликов")
    def applications_count(self, obj: PartnerTask) -> int:
        return obj.applications.count()


@admin.register(Twin)
class TwinAdmin(admin.ModelAdmin):
    list_display = ("user", "weekly_hours", "interests_summary", "completed_count")
    search_fields = ("user__username", "user__display_name")
    readonly_fields = ("updated_preview",)

    @admin.display(description="Интересы")
    def interests_summary(self, obj: Twin) -> str:
        return ", ".join(obj.interests) if obj.interests else "—"

    @admin.display(description="Пройдено модулей")
    def completed_count(self, obj: Twin) -> int:
        return len(obj.completed_modules or [])

    @admin.display(description="Компетенции")
    def updated_preview(self, obj: Twin) -> str:
        return ", ".join(
            f"{code}: {item.get('level', 0)}/{item.get('target', 0)}"
            for code, item in (obj.competencies or {}).items()
        )


@admin.register(Barrier)
class BarrierAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "category", "stage", "severity", "solved_by")
    list_filter = ("category", "stage", "severity")
    search_fields = ("code", "title", "note")


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "action", "amount", "basis_short")
    list_filter = ("action", "created_at")
    search_fields = ("basis", "user__username", "hash", "prev_hash")
    date_hierarchy = "created_at"
    readonly_fields = ("prev_hash", "hash", "created_at")

    @admin.display(description="Основание")
    def basis_short(self, obj: LedgerEntry) -> str:
        return (obj.basis[:70] + "…") if len(obj.basis) > 70 else obj.basis


@admin.register(EthicsDecision)
class EthicsDecisionAdmin(admin.ModelAdmin):
    """Журнал решений ИИ: только чтение, иначе журнал перестаёт быть журналом."""

    list_display = ("created_at", "user", "module", "rule_id", "summary")
    list_filter = ("module", "rule_id", "created_at")
    search_fields = ("summary", "chosen", "rule_id", "user__username")
    date_hierarchy = "created_at"
    readonly_fields = (
        "user",
        "created_at",
        "module",
        "rule_id",
        "summary",
        "considered",
        "rejected",
        "chosen",
        "value_codes",
        "is_mock",
    )

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False


@admin.register(TaskApplication)
class TaskApplicationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "task")
    list_filter = ("created_at", "task")
    search_fields = ("user__username", "task__title")
    date_hierarchy = "created_at"


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("title", "severity", "component", "started_at", "resolved_label", "is_open")
    list_filter = ("severity", "component", "resolved_at")
    search_fields = ("title", "summary")
    date_hierarchy = "started_at"
    actions = ("mark_resolved",)

    @admin.display(description="Восстановлено", boolean=True)
    def resolved_label(self, obj: Incident) -> bool:
        return obj.resolved_at is not None

    @admin.action(description="Отметить восстановленным сейчас")
    def mark_resolved(self, request, queryset):
        updated = queryset.filter(resolved_at__isnull=True).update(resolved_at=timezone.now())
        self.message_user(request, f"Закрыто инцидентов: {updated}")


@admin.register(StatusSample)
class StatusSampleAdmin(admin.ModelAdmin):
    """Замеры пишутся автоматически: в админке их только смотрят и чистят."""

    list_display = ("created_at", "component", "ok", "latency_ms")
    list_filter = ("component", "ok", "created_at")
    date_hierarchy = "created_at"

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False
