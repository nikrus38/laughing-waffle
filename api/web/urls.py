from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.landing, name="landing"),
    path("features/", views.features_page, name="features"),
    path("how/", views.how_page, name="how"),
    path("ethics/", views.ethics_page, name="ethics"),
    path("partners/", views.partners_page, name="partners"),
    path("install/", views.install_page, name="install"),
    path("faq/", views.faq_page, name="faq"),
    path("login/", views.login_page, name="login"),
    path("register/", views.register_page, name="register"),
    path("logout/", views.logout_page, name="logout"),
    path("demo-login/", views.demo_login, name="demo-login"),
    path("manifest.webmanifest", views.manifest, name="manifest"),
    path("sw.js", views.service_worker, name="service-worker"),
    path("offline/", views.offline, name="offline"),
    path("favicon.ico", views.favicon, name="favicon"),
    path("healthz", views.healthz, name="healthz"),
    path("assets/<path:path>", views.console_assets, name="console-assets"),
    path("app/", views.console, name="console"),
    re_path(r"^app/(?P<path>.*)$", views.console, name="console-route"),
]
