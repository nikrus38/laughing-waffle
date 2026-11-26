# ФинТвин — MVP Университета 4.0

[![CI](https://github.com/nikrus38/laughing-waffle/actions/workflows/ci.yml/badge.svg)](https://github.com/nikrus38/laughing-waffle/actions/workflows/ci.yml)

Интерактивная модель Университета 4.0: цифровой двойник, ИИ-сват, FinCoin с проверяемым
реестром и этика алгоритмов. Публичный сайт + консоль после входа, PWA и режим
Telegram Mini App.

> Всё содержимое — демонстрационное. Реальны только цифры 34,7% и 55% из исходных
> данных задания и суммы FinCoin. Официальные формулировки ценностей пока не переданы
> и честно помечены «текст уточняется».

## Быстрый старт

Нужны Python 3.12+ и Node.js 20+.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r api\requirements.txt

.\.venv\Scripts\python.exe api\manage.py migrate
.\.venv\Scripts\python.exe api\manage.py seed_demo
.\.venv\Scripts\python.exe api\manage.py runserver
```

Открыть <http://127.0.0.1:8000/>. Демо-доступ: `demo / fintwin2026`
(или кнопка «Войти как демо-студент»).

Фронтенд для правок интерфейса:

```powershell
npm install
npm run dev        # http://localhost:3000, /api проксируется на Django :8000
```

## Что внутри

| Раздел | Адрес | Что показывает |
| --- | --- | --- |
| Лендинг | `/` | продукт, роли, этика, установка как приложение |
| Консоль | `/app/` | дашборд, двойник, матч, кошелёк, этика, аналитика |
| Вход | `/login/` | сессионная авторизация Django |
| Админка | `/admin/` | данные демо: задачи, модули, реестр, ценности |
| API | `/api/…` | JSON для консоли, health-check `/api/health/` |

## Стек

- **Бэкенд:** Django 6 + Django REST Framework, SQLite в демо (переезд на PostgreSQL — в плане).
- **Фронтенд:** Vite + React 19 + TypeScript + Tailwind CSS 4 + Zustand + React Router.
- **PWA:** `manifest.webmanifest`, service worker, установка на рабочий стол и домашний экран.
- **Тесты:** pytest (34 теста бэкенда), Vitest (21 тест фронтенда), проверка типов `tsc`.
- **Бренд:** официальная палитра и шрифты Финуниверситета, см. `brand/fa/README.md`.

## Проверки

```powershell
.\.venv\Scripts\python.exe -m pytest api -q
npm run test:run
npx tsc --noEmit
npm run build
```

E2E на три демо-сценария (нужен Chromium для Playwright):

```powershell
npx playwright install chromium
npm run test:e2e
```

CI на GitHub Actions гоняет бэкенд, типы, unit-тесты, сборку и e2e на каждый push
и pull request: `.github/workflows/ci.yml`.

## Структура

```
api/                  Django: config, accounts, core, api, web, tests
src/                  React-консоль: app, features, domain, data, shared
api/web/static/web/   стили лендинга, service worker, бренд-ассеты
brand/fa/             брендбук Финуниверситета и его разбор
docs/                 решения, аналитика этапов, карта проекта
tests/                unit-тесты фронтенда
```

Подробная карта для команды: [`docs/project-map.md`](docs/project-map.md).
Журнал решений: [`docs/decisions.md`](docs/decisions.md).

## Демо-сценарии

1. **Первый месяц первокурсника:** матч → отклик → план → модуль → +20 FinCoin.
2. **Запрос индустрии:** роль «Партнёр» → декомпозиция задачи → кейсы по курсам.
3. **Соблазн лёгких баллов:** ползунок искушения → алгоритм всё равно ведёт по пути развития.

Сброс демо: `/app/demo` или кнопка на главной.
