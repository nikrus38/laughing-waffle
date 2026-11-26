#!/usr/bin/env python
"""Утилита управления Django-проектом «ФинТвин»."""
import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:  # pragma: no cover
        raise ImportError(
            "Не удалось импортировать Django. Активируйте окружение: .venv\\Scripts\\activate"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
