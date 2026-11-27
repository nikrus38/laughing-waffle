"""Серверные страницы: публичный лендинг, вход, регистрация, оболочка консоли и PWA."""
from __future__ import annotations

import json
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from accounts.models import User
from core import seed_data
from core.models import LedgerEntry, Micromodule, PartnerTask, Twin, Value

DEMO_LOGIN = seed_data.DEMO_STUDENT["username"]
DEMO_PASSWORD = seed_data.DEMO_STUDENT["password"]


def landing(request: HttpRequest) -> HttpResponse:
    stats = {
        "values": Value.objects.count() or len(seed_data.VALUES),
        "modules": Micromodule.objects.count() or len(seed_data.MODULES),
        "tasks": PartnerTask.objects.count() or len(seed_data.TASKS),
    }
    return render(request, "web/landing.html", {"stats": stats})


def features_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/features.html")


def how_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/how.html")


def ethics_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/ethics.html")


def partners_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/partners.html")


def install_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/install.html")


def faq_page(request: HttpRequest) -> HttpResponse:
    return render(request, "web/faq.html")


def status_page(request: HttpRequest) -> HttpResponse:
    """Публичная страница статуса: живые проверки, uptime за 30 дней, инциденты."""
    from core.monitoring import collect_status

    return render(request, "web/status.html", {"status": collect_status()})


def docs_page(request: HttpRequest) -> HttpResponse:
    """Документация API в стиле справочника: навигация и карточки из api_docs."""
    from web import api_docs

    context = {
        "nav": api_docs.DOC_NAV,
        "groups": api_docs.ENDPOINT_GROUPS,
        "endpoints": api_docs.ENDPOINTS,
        "base_url": api_docs.BASE_URL,
        "quickstart": api_docs.QUICKSTART,
        "coin_actions": api_docs.COIN_ACTIONS,
        "error_codes": api_docs.ERRORS,
        "endpoint_count": api_docs.endpoint_count(),
    }
    return render(request, "web/docs.html", context)


@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def login_page(request: HttpRequest) -> HttpResponse:
    error = None
    next_url = request.GET.get("next") or reverse("console")

    if request.method == "POST":
        username = (request.POST.get("username") or "").strip().lower()
        password = request.POST.get("password") or ""
        user = authenticate(request, username=username, password=password)
        if user is None:
            error = "Неверный логин или пароль."
        else:
            login(request, user)
            return redirect(next_url)

    return render(
        request,
        "web/login.html",
        {"error": error, "next": next_url, "demo_login": DEMO_LOGIN, "demo_password": DEMO_PASSWORD},
    )


@require_http_methods(["GET", "POST"])
@ensure_csrf_cookie
def register_page(request: HttpRequest) -> HttpResponse:
    error = None
    if request.method == "POST":
        username = (request.POST.get("username") or "").strip().lower()
        password = request.POST.get("password") or ""
        display_name = (request.POST.get("display_name") or "").strip()
        course = request.POST.get("course") or "1"

        if not username or len(password) < 8:
            error = "Логин обязателен, пароль — не короче 8 символов."
        elif User.objects.filter(username=username).exists():
            error = "Такой логин уже занят."
        else:
            user = User.objects.create_user(
                username=username,
                password=password,
                display_name=display_name or username,
                course=int(course) if str(course).isdigit() else 1,
            )
            Twin.objects.create(
                user=user,
                competencies={code: {"level": 20, "target": 60} for code in ["data", "code", "finance", "comm", "research", "entre", "ai", "lead"]},
                interests=[],
                weekly_hours=12,
                completed_modules=[],
                is_mock=True,
            )
            login(request, user)
            return redirect(reverse("console"))

    return render(request, "web/register.html", {"error": error})


@require_http_methods(["POST", "GET"])
def logout_page(request: HttpRequest) -> HttpResponse:
    logout(request)
    return redirect(reverse("landing"))


def demo_login(request: HttpRequest) -> HttpResponse:
    """Быстрый вход для комиссии: фиксированная демо-персона, без персональных данных."""
    user = authenticate(request, username=DEMO_LOGIN, password=DEMO_PASSWORD)
    if user is not None:
        login(request, user)
    return redirect(reverse("console"))


def _console_index() -> Path:
    return Path(settings.FRONTEND_DIST) / "index.html"


@login_required(login_url="/login/")
def console(request: HttpRequest, path: str = "") -> HttpResponse:
    index = _console_index()
    if not index.exists():
        return render(request, "web/console_missing.html", status=503)
    response = HttpResponse(index.read_text(encoding="utf-8"))
    # HTML консоли не кэшируем: он ссылается на хэшированные ассеты новой сборки
    response["Cache-Control"] = "no-cache, must-revalidate"
    return response


def console_assets(request: HttpRequest, path: str) -> HttpResponse:
    """Отдаёт собранные ассеты React-консоли из dist/assets."""
    base = Path(settings.FRONTEND_DIST) / "assets"
    target = (base / path).resolve()
    if base.resolve() not in target.parents or not target.is_file():
        return HttpResponse(status=404)
    content_type = "application/javascript" if target.suffix == ".js" else "text/css"
    response = HttpResponse(target.read_bytes(), content_type=content_type)
    # Имена файлов содержат хэш — можно кэшировать навсегда.
    response["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


def manifest(request: HttpRequest) -> JsonResponse:
    payload = {
        "id": "/app/",
        "name": settings.PWA_NAME,
        "short_name": settings.PWA_SHORT_NAME,
        "description": "Демонстрационная модель Университета 4.0: цифровой двойник, ИИ-сват, FinCoin и этика алгоритмов.",
        "start_url": "/app/",
        "scope": "/",
        "display": "standalone",
        "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
        "orientation": "portrait",
        "background_color": settings.PWA_BACKGROUND_COLOR,
        "theme_color": settings.PWA_THEME_COLOR,
        "lang": "ru",
        "dir": "ltr",
        "categories": ["education", "productivity"],
        "prefer_related_applications": False,
        "launch_handler": {"client_mode": "focus-existing"},
        "icons": [
            {"src": "/static/web/brand/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "/static/web/brand/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "/static/web/brand/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
        "screenshots": [
            {
                "src": "/static/web/screens/console-mobile.png",
                "sizes": "390x844",
                "type": "image/png",
                "form_factor": "narrow",
                "label": "Консоль студента на телефоне",
            },
            {
                "src": "/static/web/screens/console-desktop.png",
                "sizes": "1440x950",
                "type": "image/png",
                "form_factor": "wide",
                "label": "Дашборд консоли на компьютере",
            },
        ],
        "shortcuts": [
            {"name": "Двойник", "url": "/app/twin"},
            {"name": "Матч", "url": "/app/matcher"},
            {"name": "Кошелёк", "url": "/app/wallet"},
            {"name": "Этика", "url": "/app/ethics"},
        ],
    }
    response = JsonResponse(payload, json_dumps_params={"ensure_ascii": False})
    response["Content-Type"] = "application/manifest+json"
    return response


def service_worker(request: HttpRequest) -> HttpResponse:
    path = Path(__file__).resolve().parent / "static" / "web" / "sw.js"
    response = HttpResponse(path.read_text(encoding="utf-8"), content_type="application/javascript")
    response["Service-Worker-Allowed"] = "/"
    response["Cache-Control"] = "no-cache"
    return response


def offline(request: HttpRequest) -> HttpResponse:
    return render(request, "web/offline.html")


def favicon(request: HttpRequest) -> HttpResponse:
    """Отдаём иконку напрямую (200), чтобы браузер не кэшировал 404."""
    path = Path(__file__).resolve().parent / "static" / "web" / "brand" / "icon-192.png"
    return HttpResponse(path.read_bytes(), content_type="image/png")


def healthz(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"status": "ok", "demo": True})
