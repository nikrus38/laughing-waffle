"""Демо-профили и админка: две персоны, вход партнёром, панель управления."""
import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from core.models import Twin

User = get_user_model()


@pytest.fixture
def catalog(db):
    call_command("seed_demo")
    return User.objects.get(username="demo")


@pytest.mark.django_db
def test_seed_creates_two_demo_personas(catalog):
    student = User.objects.get(username="demo")
    partner = User.objects.get(username="partner")

    assert student.role == User.Role.STUDENT
    assert partner.role == User.Role.PARTNER
    assert partner.display_name == "Марина Соколова"
    assert Twin.objects.filter(user=partner).exists()


@pytest.mark.django_db
def test_partner_login_switches_account(client, catalog):
    client.get("/demo-login/")
    assert int(client.session["_auth_user_id"]) == User.objects.get(username="demo").id

    response = client.get("/demo-login/partner/")
    assert response.status_code == 302
    assert int(client.session["_auth_user_id"]) == User.objects.get(username="partner").id

    me = client.get("/api/me/").json()
    assert me["user"]["role"] == "partner"


@pytest.mark.django_db
def test_student_login_returns_from_partner(client, catalog):
    client.get("/demo-login/partner/")
    client.get("/demo-login/")

    me = client.get("/api/me/").json()
    assert me["user"]["role"] == "student"


@pytest.mark.django_db
def test_seed_admin_creates_superuser(catalog):
    call_command("seed_admin", password="secret123", verbosity=0)

    admin = User.objects.get(username="admin")
    assert admin.is_staff and admin.is_superuser
    assert admin.check_password("secret123")


@pytest.mark.django_db
def test_admin_pages_open_for_superuser(client, catalog):
    call_command("seed_admin", password="secret123", verbosity=0)
    assert client.login(username="admin", password="secret123")

    urls = [
        "/admin/",
        "/admin/accounts/user/",
        "/admin/core/partnertask/",
        "/admin/core/ledgerentry/",
        "/admin/core/incident/",
        "/admin/core/statussample/",
    ]
    for url in urls:
        response = client.get(url)
        assert response.status_code == 200, url
