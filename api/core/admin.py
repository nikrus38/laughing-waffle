from django.contrib import admin

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
    list_display = ("code", "name", "official_text")
    search_fields = ("code", "name")


@admin.register(EthicsRule)
class EthicsRuleAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "module", "value")
    list_filter = ("module", "value")


@admin.register(Micromodule)
class MicromoduleAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "minutes", "difficulty", "kind")
    list_filter = ("kind", "difficulty")


@admin.register(PartnerTask)
class PartnerTaskAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "partner_label", "difficulty", "weeks")
    list_filter = ("difficulty",)
    search_fields = ("title", "partner_label")


@admin.register(Twin)
class TwinAdmin(admin.ModelAdmin):
    list_display = ("user", "weekly_hours")
    search_fields = ("user__username", "user__display_name")


@admin.register(Barrier)
class BarrierAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "category", "stage", "severity", "solved_by")
    list_filter = ("category", "stage", "severity")


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "action", "amount")
    list_filter = ("action",)
    search_fields = ("basis", "user__username")
    readonly_fields = ("prev_hash", "hash")


@admin.register(EthicsDecision)
class EthicsDecisionAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "module", "rule_id", "summary")
    list_filter = ("module", "rule_id")


@admin.register(TaskApplication)
class TaskApplicationAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "task")


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("title", "severity", "component", "started_at", "resolved_at")
    list_filter = ("severity", "component")
    date_hierarchy = "started_at"


@admin.register(StatusSample)
class StatusSampleAdmin(admin.ModelAdmin):
    """Замеры пишутся автоматически: в админке их только смотрят и чистят."""

    list_display = ("created_at", "component", "ok", "latency_ms")
    list_filter = ("component", "ok")
    date_hierarchy = "created_at"

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False
