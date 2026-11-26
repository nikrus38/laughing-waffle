from django.contrib import admin

from .models import (
    Barrier,
    EthicsDecision,
    EthicsRule,
    LedgerEntry,
    Micromodule,
    PartnerTask,
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
