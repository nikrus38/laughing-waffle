"""Тесты страницы статуса и документации API.

Проверяем три вещи: эндпоинт отдаёт реальные замеры, страница статуса не врёт
про отсутствие данных, а документация описывает все эндпоинты из api_docs.
"""
import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from core.models import Incident, StatusSample
from core.monitoring import HISTORY_DAYS
from web import api_docs

User = get_user_model()


@pytest.fixture
def catalog(db):
    call_command("seed_demo")
    return User.objects.get(username="demo")


@pytest.mark.django_db
def test_status_endpoint_is_public_and_complete(client, catalog):
    response = client.get("/api/status/")
    assert response.status_code == 200

    data = response.json()
    assert data["overall"] in {"operational", "degraded", "outage"}
    assert len(data["components"]) == 4
    assert len(data["days"]) == HISTORY_DAYS
    assert data["monitoring"]["dataVersion"] == "real"


@pytest.mark.django_db
def test_status_endpoint_records_and_throttles_samples(client, catalog):
    client.get("/api/status/")
    first = StatusSample.objects.count()
    assert first == 4  # по одному замеру на компонент

    client.get("/api/status/")
    assert StatusSample.objects.count() == first  # чаще раза в минуту не пишем


@pytest.mark.django_db
def test_status_page_marks_days_without_data(client, catalog):
    response = client.get("/status/")
    assert response.status_code == 200

    html = response.content.decode()
    assert "Статус платформы" in html
    assert "нет данных" in html  # история только началась, пропуски честно подписаны
    assert "Проверить сейчас" in html


@pytest.mark.django_db
def test_status_page_shows_incidents(client, catalog):
    Incident.objects.create(
        title="Перезапуск контейнера web",
        summary="Короткий простой во время обновления.",
        severity=Incident.Severity.DEGRADED,
        component="web",
    )
    response = client.get("/status/")
    assert "Перезапуск контейнера web" in response.content.decode()


@pytest.mark.django_db
def test_docs_page_lists_every_endpoint(client, catalog):
    response = client.get("/docs/")
    assert response.status_code == 200

    html = response.content.decode()
    for endpoint in api_docs.ENDPOINTS:
        assert f'id="endpoint-{endpoint["id"]}"' in html, endpoint["id"]
        assert endpoint["path"] in html, endpoint["path"]


@pytest.mark.django_db
def test_docs_navigation_matches_sections(client, catalog):
    """Оглавление не должно ссылаться на несуществующие разделы."""
    html = client.get("/docs/").content.decode()

    for group in api_docs.DOC_NAV:
        for item in group["items"]:
            assert f'id="{item["id"]}"' in html, item["id"]


@pytest.mark.django_db
def test_health_endpoint_stays_cheap(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
