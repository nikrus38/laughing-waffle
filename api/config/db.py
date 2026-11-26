"""Выбор базы данных через переменные окружения.

По умолчанию — SQLite, чтобы демо запускалось без установки сервера.
Для PostgreSQL достаточно задать DATABASE_URL (или POSTGRES_* + DB_ENGINE=postgres).
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse

POSTGRES_SCHEMES = {"postgres", "postgresql", "psql"}


def _postgres_options(query: str) -> dict:
    params = parse_qs(query)
    options: dict[str, str] = {}
    sslmode = params.get("sslmode", [None])[0]
    if sslmode:
        options["sslmode"] = sslmode
    return options


def database_settings(default_sqlite: Path, env: dict[str, str] | None = None) -> dict:
    """Возвращает конфиг Django DATABASES['default'].

    Приоритет: DATABASE_URL → POSTGRES_* + DB_ENGINE=postgres → SQLite.
    """
    source = os.environ if env is None else env
    url = (source.get("DATABASE_URL") or "").strip()

    if url:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()

        if scheme in POSTGRES_SCHEMES:
            return {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": (parsed.path or "/fintwin").lstrip("/") or "fintwin",
                "USER": parsed.username or "",
                "PASSWORD": parsed.password or "",
                "HOST": parsed.hostname or "",
                "PORT": str(parsed.port or ""),
                "CONN_MAX_AGE": int(source.get("DB_CONN_MAX_AGE", "60")),
                "OPTIONS": _postgres_options(parsed.query),
            }

        if scheme == "sqlite":
            name = parsed.path or ""
            if name.startswith("/") and len(name) > 2 and name[2] == ":":
                # sqlite:///C:/data/fintwin.db → C:/data/fintwin.db
                name = name[1:]
            elif name.startswith("//"):
                # sqlite:////var/lib/fintwin.db → /var/lib/fintwin.db
                name = name[1:]
            elif name.startswith("/"):
                name = name[1:]
            return {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": name or ":memory:",
            }

    if (source.get("DB_ENGINE") or "").lower() == "postgres":
        return {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": source.get("POSTGRES_DB", "fintwin"),
            "USER": source.get("POSTGRES_USER", "fintwin"),
            "PASSWORD": source.get("POSTGRES_PASSWORD", ""),
            "HOST": source.get("POSTGRES_HOST", "127.0.0.1"),
            "PORT": source.get("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": int(source.get("DB_CONN_MAX_AGE", "60")),
        }

    return {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(default_sqlite),
    }
