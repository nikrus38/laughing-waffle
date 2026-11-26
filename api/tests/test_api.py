import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from core.models import LedgerEntry, Micromodule, PartnerTask, Twin, Value

User = get_user_model()


@pytest.fixture
def catalog(db):
    call_command("seed_demo")
    return User.objects.get(username="demo")


@pytest.fixture
def api(client, catalog):
    client.force_login(catalog)
    return client


@pytest.mark.django_db
def test_bootstrap_requires_auth(client, catalog):
    response = client.get("/api/bootstrap/")
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_bootstrap_returns_console_payload(api):
    response = api.get("/api/bootstrap/")
    assert response.status_code == 200
    data = response.json()

    assert data["mode"] == "server"
    assert data["user"]["displayName"] == "Александр Петров"
    assert data["balance"] > 0
    assert len(data["tasks"]) == PartnerTask.objects.count()
    assert len(data["modules"]) == Micromodule.objects.count()
    assert len(data["values"]) == 10
    assert len(data["ledger"]) == 5
    assert len(data["ethicsLog"]) >= 6


@pytest.mark.django_db
def test_tasks_have_explainable_match(api):
    data = api.get("/api/bootstrap/").json()
    for task in data["tasks"]:
        assert 0 <= task["match"]["score"] <= 100
        assert len(task["match"]["factors"]) == 4
    assert any(task["match"]["isStretch"] for task in data["tasks"][:3])


@pytest.mark.django_db
def test_module_completion_updates_twin_and_awards(api, catalog):
    twin = Twin.objects.get(user=catalog)
    module = Micromodule.objects.get(code="mm-3")
    before_level = twin.competencies["finance"]["level"]
    before_balance = sum(entry.amount for entry in catalog.ledger_entries.all())

    response = api.post(
        f"/api/modules/{module.code}/complete/",
        data={"performance": 1.0},
        content_type="application/json",
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["amount"] == 20
    assert payload["balance"] == before_balance + 20

    twin.refresh_from_db()
    assert twin.competencies["finance"]["level"] > before_level
    assert module.code in twin.completed_modules


@pytest.mark.django_db
def test_module_cannot_be_completed_twice(api):
    module = Micromodule.objects.get(code="mm-1")  # уже пройден у демо-студента
    response = api.post(f"/api/modules/{module.code}/complete/", data={}, content_type="application/json")
    assert response.status_code == 400
    assert "уже пройден" in response.json()["reason"]


@pytest.mark.django_db
def test_award_rejects_duplicate_basis(api):
    payload = {"action": "market_value", "basis": "Первый платящий клиент (пример)"}
    first = api.post("/api/ledger/award/", data=payload, content_type="application/json")
    second = api.post("/api/ledger/award/", data=payload, content_type="application/json")

    assert first.status_code == 200
    assert second.status_code == 400
    assert "уже засчитано" in second.json()["reason"]


@pytest.mark.django_db
def test_verify_chain_endpoint(api):
    response = api.post("/api/ledger/verify/", data={}, content_type="application/json")
    assert response.status_code == 200
    payload = response.json()
    assert payload["valid"] is True
    assert payload["count"] == LedgerEntry.objects.count()


@pytest.mark.django_db
def test_register_creates_user_and_twin(client):
    response = client.post(
        "/api/auth/register/",
        data={
            "username": "newstudent",
            "password": "strong-pass-123",
            "displayName": "Новый Студент",
            "course": 2,
        },
        content_type="application/json",
    )

    assert response.status_code == 201
    user = User.objects.get(username="newstudent")
    assert user.course == 2
    assert Twin.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_demo_reset_restores_twin_and_clears_applications(api, catalog):
    from core import seed_data
    from core.models import TaskApplication

    module = Micromodule.objects.get(code="mm-3")
    api.post(f"/api/modules/{module.code}/complete/", data={}, content_type="application/json")

    task = PartnerTask.objects.first()
    api.post(f"/api/tasks/{task.code}/apply/", data={}, content_type="application/json")
    assert TaskApplication.objects.filter(user=catalog).exists()

    response = api.post("/api/demo/reset/", data={}, content_type="application/json")
    assert response.status_code == 200

    twin = Twin.objects.get(user=catalog)
    assert twin.completed_modules == seed_data.DEMO_STUDENT["completed_modules"]
    assert not TaskApplication.objects.filter(user=catalog).exists()
    assert LedgerEntry.objects.filter(user=catalog).count() == len(seed_data.STARTER_LEDGER)


@pytest.mark.django_db
def test_decompose_returns_cases(api):
    response = api.post(
        "/api/decompose/",
        data={"preset": "churn"},
        content_type="application/json",
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["cases"]) >= 4
    assert payload["totalCoins"] == sum(case["coins"] for case in payload["cases"])


@pytest.mark.django_db
def test_landing_and_manifest_are_public(client):
    landing = client.get("/")
    assert landing.status_code == 200
    assert "ФинТвин" in landing.content.decode()

    manifest = client.get("/manifest.webmanifest")
    assert manifest.status_code == 200
    assert manifest["Content-Type"].startswith("application/manifest+json")
    assert manifest.json()["start_url"] == "/app/"


@pytest.mark.django_db
def test_console_requires_login(client):
    response = client.get("/app/")
    assert response.status_code == 302
    assert "/login/" in response["Location"]


@pytest.mark.django_db
def test_health_is_public(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.django_db
def test_csrf_endpoint_sets_cookie(client):
    response = client.get("/api/csrf/")
    assert response.status_code == 200
    assert "csrftoken" in response.cookies


@pytest.mark.django_db
def test_manifest_has_install_metadata(client):
    data = client.get("/manifest.webmanifest").json()
    assert data["display"] == "standalone"
    assert len(data["icons"]) == 3
    assert len(data["screenshots"]) == 2
    assert data["display_override"][0] == "window-controls-overlay"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "path",
    ["/features/", "/how/", "/ethics/", "/partners/", "/install/", "/faq/"],
)
def test_public_site_pages_render(client, path):
    response = client.get(path)
    assert response.status_code == 200
    assert "ФинТвин" in response.content.decode()


@pytest.mark.django_db
def test_home_links_to_separate_sections(client):
    html = client.get("/").content.decode()
    for path in ["/features/", "/how/", "/ethics/", "/partners/", "/install/"]:
        assert f'href="{path}"' in html
