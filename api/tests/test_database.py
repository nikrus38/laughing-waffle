from pathlib import Path

from config.db import database_settings


def test_default_is_sqlite(tmp_path):
    config = database_settings(tmp_path / "db.sqlite3", env={})
    assert config["ENGINE"] == "django.db.backends.sqlite3"
    assert config["NAME"].endswith("db.sqlite3")


def test_postgres_url_is_parsed():
    config = database_settings(
        Path("db.sqlite3"),
        env={
            "DATABASE_URL": "postgresql://fintwin:secret@db.example:6543/fintwin?sslmode=require",
        },
    )

    assert config["ENGINE"] == "django.db.backends.postgresql"
    assert config["NAME"] == "fintwin"
    assert config["USER"] == "fintwin"
    assert config["PASSWORD"] == "secret"
    assert config["HOST"] == "db.example"
    assert config["PORT"] == "6543"
    assert config["OPTIONS"] == {"sslmode": "require"}


def test_postgres_scheme_aliases():
    for scheme in ("postgres", "psql"):
        config = database_settings(
            Path("db.sqlite3"),
            env={"DATABASE_URL": f"{scheme}://user@localhost:5432/fintwin"},
        )
        assert config["ENGINE"] == "django.db.backends.postgresql"
        assert config["NAME"] == "fintwin"


def test_explicit_postgres_env():
    config = database_settings(
        Path("db.sqlite3"),
        env={
            "DB_ENGINE": "postgres",
            "POSTGRES_DB": "fintwin_demo",
            "POSTGRES_USER": "demo",
            "POSTGRES_PASSWORD": "pass",
            "POSTGRES_HOST": "127.0.0.1",
            "POSTGRES_PORT": "5432",
        },
    )

    assert config["ENGINE"] == "django.db.backends.postgresql"
    assert config["NAME"] == "fintwin_demo"
    assert config["USER"] == "demo"


def test_sqlite_url_variants():
    relative = database_settings(Path("db.sqlite3"), env={"DATABASE_URL": "sqlite:///demo.sqlite3"})
    assert relative["NAME"] == "demo.sqlite3"

    absolute = database_settings(Path("db.sqlite3"), env={"DATABASE_URL": "sqlite:////tmp/demo.sqlite3"})
    assert absolute["NAME"] == "/tmp/demo.sqlite3"

    memory = database_settings(Path("db.sqlite3"), env={"DATABASE_URL": "sqlite:///:memory:"})
    assert memory["NAME"] == ":memory:"
