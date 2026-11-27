# ---------- Сборка фронтенда ----------
FROM node:22-alpine AS frontend
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Django + gunicorn ----------
FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY api/requirements.txt /app/api/requirements.txt
RUN pip install --no-cache-dir -r /app/api/requirements.txt

COPY api /app/api
COPY --from=frontend /src/dist /app/dist
COPY deploy/entrypoint.sh /app/entrypoint.sh

RUN useradd -m app \
    && chmod +x /app/entrypoint.sh \
    && mkdir -p /srv/static \
    && chown -R app:app /app /srv/static

USER app
WORKDIR /app/api

ENV FRONTEND_DIST=/app/dist \
    DJANGO_STATIC_ROOT=/srv/static

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
