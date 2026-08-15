# Bilimjol API (NestJS + Prisma). Контекст сборки — корень монорепо.
# Подходит для Railway / Render / Fly и любого Docker-хоста.
FROM node:20-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# 1) Манифесты воркспейса — для кэшируемой установки строго по lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
# Схема Prisma нужна ДО install: postinstall выполняет `prisma generate`
COPY apps/api/prisma ./apps/api/prisma

# Ставим зависимости только API (dev-зависимости нужны для сборки)
RUN pnpm install --frozen-lockfile --filter @izn-study/api

# 2) Исходники API и сборка: prisma generate + nest build
COPY apps/api ./apps/api
RUN pnpm --filter @izn-study/api build

ENV NODE_ENV=production
EXPOSE 4000

# Применяем миграции и запускаем сервер (порт берётся из $PORT хостинга)
CMD ["pnpm", "--filter", "@izn-study/api", "run", "start:prod"]
