#!/bin/sh
set -e

echo "Применяем миграции..."
python manage.py migrate --noinput

if [ "${SEED_DEMO:-1}" = "1" ]; then
  echo "Заполняем демо-данные..."
  python manage.py seed_demo
fi

echo "Собираем статику..."
python manage.py collectstatic --noinput

echo "Запускаем gunicorn..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-3}" \
  --timeout 60 \
  --access-logfile -
