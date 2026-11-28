"""Админка демо-стенда: порядок разделов, заголовки и стартовая страница."""
from django.contrib.admin import AdminSite

# Порядок важнее алфавита: сначала то, с чем работают каждый день.
MODEL_ORDER = [
    "Value",
    "EthicsRule",
    "Micromodule",
    "PartnerTask",
    "TaskApplication",
    "Twin",
    "User",
    "Group",
    "LedgerEntry",
    "EthicsDecision",
    "Barrier",
    "Incident",
    "StatusSample",
]


class FinTwinAdminSite(AdminSite):
    site_header = "ФинТвин — панель управления"
    site_title = "ФинТвин"
    index_title = "Данные демо-стенда Университета 4.0"
    index_template = "admin/fintwin_index.html"

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)

        def sort_key(model: dict) -> int:
            name = model["object_name"]
            return MODEL_ORDER.index(name) if name in MODEL_ORDER else 99

        for app in app_list:
            app["models"].sort(key=sort_key)
        return app_list
