from django.urls import path

from . import views

urlpatterns = [
    path("auth/register/", views.register, name="api-register"),
    path("auth/login/", views.login_view, name="api-login"),
    path("auth/logout/", views.logout_view, name="api-logout"),
    path("me/", views.me, name="api-me"),
    path("bootstrap/", views.bootstrap, name="api-bootstrap"),
    path("tasks/", views.tasks, name="api-tasks"),
    path("tasks/<str:code>/apply/", views.apply_to_task, name="api-task-apply"),
    path("modules/<str:code>/complete/", views.complete_module, name="api-module-complete"),
    path("ledger/", views.ledger_list, name="api-ledger"),
    path("ledger/award/", views.ledger_award, name="api-ledger-award"),
    path("ledger/verify/", views.ledger_verify, name="api-ledger-verify"),
    path("ethics/", views.ethics, name="api-ethics"),
    path("diagnostics/barriers/", views.barriers, name="api-barriers"),
    path("diagnostics/forecast/", views.forecast, name="api-forecast"),
    path("decompose/", views.decompose_task, name="api-decompose"),
    path("demo/reset/", views.demo_reset, name="api-demo-reset"),
    path("health/", views.health, name="api-health"),
]
