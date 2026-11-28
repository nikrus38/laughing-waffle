# Деплой «ФинТвин» на VPS (Docker + Caddy + PostgreSQL)

Схема: `Caddy` (HTTPS и статика) → `web` (Django + gunicorn) → `db` (PostgreSQL).
Домен — бесплатный поддомен DuckDNS. Сертификат Caddy получает сам.

## Что нужно

- VPS с Ubuntu 22.04/24.04 и SSH-доступом (root или sudo).
- Поддомен на [duckdns.org](https://www.duckdns.org), например `fintwin.duckdns.org`.
- Открытые порты **22, 80, 443**.

## 1. DuckDNS

1. Войдите через GitHub/Google, создайте поддомен `fintwin`.
2. В поле `current ip` укажите публичный IP сервера и нажмите `update ip`.
3. Проверьте: `nslookup fintwin.duckdns.org` должен вернуть IP сервера.
4. Если IP динамический, настройте обновление по cron (DuckDNS даёт ссылку `update?domains=...&token=...`).

## 2. Сервер

```bash
ssh root@<IP>
apt update && apt upgrade -y
apt install -y ca-certificates curl git ufw
curl -fsSL https://get.docker.com | sh
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
```

Проверьте: `docker --version` и `docker compose version`.

## 3. Код и настройки

```bash
mkdir -p /opt && cd /opt
git clone https://github.com/nikrus38/laughing-waffle.git fintwin
cd fintwin

cp deploy/.env.prod.example deploy/.env
nano deploy/.env
```

Заполните:

- `DOMAIN` — поддомен DuckDNS;
- `DJANGO_SECRET_KEY` — 50+ случайных символов
  (`python3 -c "import secrets;print(secrets.token_urlsafe(50))"`);
- `POSTGRES_PASSWORD` — сильный пароль;
- `ADMIN_USERNAME` и `ADMIN_PASSWORD` — доступ в `/admin/` (создаётся при старте);
- `SEED_DEMO=1` для демо (на реальном пилоте поставьте `0`).

`.env` в git не попадает — он в `.gitignore`.

## 3.1. Админка и демо-персоны

`seed_demo` создаёт две отдельные персоны: студента `demo` и партнёра `partner`
(пароль у обеих `fintwin2026`). Переключение между ними — настоящая смена аккаунта:
`/demo-login/` и `/demo-login/partner/`.

Суперпользователь для `/admin/` создаётся из `ADMIN_PASSWORD` при каждом старте
контейнера. Сменить пароль на работающем стенде:

```bash
cd /opt/fintwin
docker compose -f deploy/docker-compose.yml exec web python manage.py seed_admin \
  --username admin --password 'новый-пароль'
```

Пароль админа — единственный секрет, который не лежит в репозитории. Для пилота
задайте свой, а не значение из примеров.

## 4. Запуск

```bash
cd /opt/fintwin
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```

Первый запуск собирает фронтенд и ставит зависимости — 3–7 минут.
Проверка:

```bash
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs -f web
curl -I https://fintwin.duckdns.org/
```

Caddy сам выпустит сертификат, когда DNS уже указывает на сервер и порт 80 открыт.
Если сертификат не выдался — смотрите `docker compose logs caddy`.

## 5. Telegram

В BotFather:

1. `/mybots` → ваш бот → `Bot Settings` → `Menu Button` → `Configure menu button`.
2. URL: `https://fintwin.duckdns.org/app/`.
3. Для трёх сценариев можно сделать ссылки вида
   `https://t.me/<bot>?startapp=scenario-1` (обрабатывается в `TelegramBridge`).

## 6. Обновление

```bash
cd /opt/fintwin
git pull
docker compose -f deploy/docker-compose.yml up -d --build
```

Миграции и `collectstatic` выполняются в `entrypoint.sh` при старте контейнера.

## 7. Резервные копии

```bash
# дамп базы
docker compose -f deploy/docker-compose.yml exec -T db \
  pg_dump -U fintwin fintwin > backup-$(date +%F).sql

# восстановление
cat backup-2026-12-01.sql | docker compose -f deploy/docker-compose.yml exec -T db \
  psql -U fintwin -d fintwin
```

Раз в неделю копируйте дамп с сервера (`scp`) — этого достаточно для демо.

## 7.1. Мониторинг доступности (страница /status/)

Страница `/status/` показывает живые проверки, uptime за 30 дней и инциденты.
Замер пишется при открытии страницы, но чтобы история не прерывалась ночью,
поставьте таймер: он раз в 5 минут дергает `manage.py monitor_ping`.

```bash
cd /opt/fintwin
cp deploy/monitor/fintwin-monitor.service /etc/systemd/system/
cp deploy/monitor/fintwin-monitor.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now fintwin-monitor.timer

# проверить, что замер пишется
systemctl list-timers | grep fintwin
docker compose -f deploy/docker-compose.yml exec -T web python manage.py monitor_ping
```

Инциденты заводятся вручную в админке (`/admin/` → «Инциденты»), когда
компонент действительно падал. Записи старше 90 дней `monitor_ping` удаляет сам.

## 7.2. Страница документации

API-справочник живёт на `/docs/` и собирается из `api/web/api_docs.py`.
Меняется контракт — правится один файл, страница и оглавление обновляются сами.
Тест `api/tests/test_status.py` проверяет, что каждый эндпоинт описан,
а ссылки оглавления ведут на существующие разделы.

## 8. Что нужно, чтобы деплой выполнил агент

Агент может сам выполнить шаги 2–6 по SSH, если дать ему доступ:

- IP или hostname сервера;
- SSH-пользователь (например `root`);
- SSH-ключ (путь к файлу) **или** пароль;
- подтверждение, что порты 80/443 открыты;
- поддомен DuckDNS, уже указывающий на этот IP.

Без SSH-доступа агент может только подготовить файлы и команды — установить
что-либо на удалённую машину он не сможет.

## 9. Ограничения и риски

- SQLite в контейнере не используется: только PostgreSQL.
- Нет S3/бэкапов «из коробки» — дампы вручную.
- Нет мониторинга: для пилота достаточно `docker compose logs` и `curl` раз в день.
- HTTPS обязателен для Telegram и PWA; Caddy решает это автоматически.
