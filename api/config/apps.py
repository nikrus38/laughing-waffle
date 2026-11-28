from django.contrib.admin.apps import AdminConfig


class FinTwinAdminConfig(AdminConfig):
    """Подключает собственную админку с порядком разделов и демо-панелью."""

    default_site = "config.admin_site.FinTwinAdminSite"
