"""Кабинет партнёра: свои задачи, отклики и запрет студенческих действий."""
import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import Client

from core.models import Micromodule, PartnerTask, TaskApplication

User = get_user_model()

TASK_PAYLOAD = {
    "title": "Прогноз ликвидности портфеля",
    "summary": "Нужно собрать прототип модели прогноза ликвидности на обезличенных данных и защитить его.",
    "difficulty": 3,
    "weeks": 6,
    "tags": ["риск-аналитика", "данные"],
    "required": {"data": 60, "finance": 50},
}


@pytest.fixture
def seeded(db):
    call_command("seed_demo")
    return User.objects.get(username="partner")


@pytest.fixture
def partner(seeded):
    return seeded


@pytest.fixture
def partner_client(partner):
    # Свой клиент: в одном тесте нужны обе сессии одновременно.
    client = Client()
    client.force_login(partner)
    return client


@pytest.fixture
def student_client(seeded):
    client = Client()
    client.force_login(User.objects.get(username="demo"))
    return client


@pytest.mark.django_db
def test_overview_is_filled_with_demo_data(partner_client):
    response = partner_client.get("/api/partner/overview/")
    assert response.status_code == 200

    data = response.json()
    assert data["stats"]["tasks"] >= 10
    assert data["stats"]["applications"] >= 3
    assert data["applications"][0]["taskTitle"]
    assert data["applications"][0]["match"] is not None
    assert data["demand"]


@pytest.mark.django_db
def test_student_cannot_open_partner_cabinet(student_client):
    assert student_client.get("/api/partner/overview/").status_code == 403
    assert student_client.get("/api/partner/tasks/").status_code == 403


@pytest.mark.django_db
def test_partner_cannot_apply_or_earn(partner_client):
    task = PartnerTask.objects.first()
    module = Micromodule.objects.first()

    assert (
        partner_client.post(
            f"/api/tasks/{task.code}/apply/", data={}, content_type="application/json"
        ).status_code
        == 403
    )
    assert (
        partner_client.post(
            f"/api/modules/{module.code}/complete/", data={}, content_type="application/json"
        ).status_code
        == 403
    )
    assert (
        partner_client.post(
            "/api/ledger/award/",
            data={"action": "data_challenge", "basis": "проверка"},
            content_type="application/json",
        ).status_code
        == 403
    )


@pytest.mark.django_db
def test_partner_creates_task(partner_client, partner):
    response = partner_client.post(
        "/api/partner/tasks/", data=TASK_PAYLOAD, content_type="application/json"
    )
    assert response.status_code == 201

    payload = response.json()["task"]
    task = PartnerTask.objects.get(code=payload["id"])
    assert task.owner == partner
    assert task.status == "open"
    assert task.required == {"data": 60, "finance": 50}
    assert payload["applicationsCount"] == 0


@pytest.mark.django_db
def test_task_validation_rejects_short_text(partner_client):
    response = partner_client.post(
        "/api/partner/tasks/",
        data={"title": "x", "summary": "y"},
        content_type="application/json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_partner_closes_task_and_student_cannot_apply(partner_client, student_client):
    task = PartnerTask.objects.first()

    response = partner_client.post(
        f"/api/partner/tasks/{task.code}/status/",
        data={"status": "closed"},
        content_type="application/json",
    )
    assert response.status_code == 200
    task.refresh_from_db()
    assert task.status == "closed"

    response = student_client.post(
        f"/api/tasks/{task.code}/apply/", data={}, content_type="application/json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_application_status_transition(partner_client):
    application = TaskApplication.objects.first()

    response = partner_client.patch(
        f"/api/partner/applications/{application.id}/",
        data={"status": "invited"},
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json()["application"]["status"] == "invited"

    application.refresh_from_db()
    assert application.status == "invited"


@pytest.mark.django_db
def test_partner_edits_own_task(partner_client):
    task = PartnerTask.objects.filter(owner__username="partner").first()

    response = partner_client.patch(
        f"/api/partner/tasks/{task.code}/",
        data={"title": "Новое название задачи", "weeks": 9},
        content_type="application/json",
    )
    assert response.status_code == 200

    task.refresh_from_db()
    assert task.title == "Новое название задачи"
    assert task.weeks == 9
