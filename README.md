# Next.js Starter — Postgres + Prisma + Better Auth + Tailwind

Болванка для быстрого старта: авторизация по почте и паролю, база в Docker для локальной разработки, деплой на Vercel.

## Стек

| Слой        | Технология                                                       |
| ----------- | ---------------------------------------------------------------- |
| Фреймворк   | Next.js 16 (App Router, Turbopack), React 19                      |
| База        | PostgreSQL 17 — локально в Docker, на проде Prisma Postgres       |
| ORM         | Prisma 7 + driver adapter `@prisma/adapter-pg`                    |
| Авторизация | Better Auth — email + пароль, сессии в БД                         |
| Стили       | Tailwind CSS v4                                                   |

## Быстрый старт

```bash
# 1. Зависимости (postinstall сам сгенерирует клиент Prisma)
npm install

# 2. Переменные окружения
cp .env.example .env.local
# сгенерировать секрет: openssl rand -base64 32  ->  BETTER_AUTH_SECRET

# 3. Поднять Postgres в Docker
npm run db:up

# 4. Накатить миграции
npm run db:migrate

# 5. Запустить
npm run dev
```

Приложение — http://localhost:3000 (если порт занят, Next.js сам переедет на 3001 — авторизация работает на любом локальном порту).

> **Порт Postgres** в `docker-compose.yml` проброшен как **5434**: 5432 и 5433 на этой машине уже заняты другими инстансами. Поменяете порт — обновите `DATABASE_URL` в `.env.local`.

> **`BETTER_AUTH_URL` локально задавать не нужно.** Better Auth сверяет Origin запроса с этим адресом, поэтому прописанный `http://localhost:3000` при дев-сервере на 3001 даёт ошибку `Invalid origin`. В dev-режиме `src/lib/auth.ts` разрешает любой порт на localhost; переменная нужна только на проде.

## Скрипты

| Команда               | Что делает                                                    |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | dev-сервер                                                    |
| `npm run build`       | production-сборка (клиент Prisma генерирует postinstall)      |
| `npm run db:up`       | поднять Postgres в Docker                                     |
| `npm run db:down`     | остановить контейнер (данные остаются в volume)               |
| `npm run db:reset`    | снести том с данными и поднять чистую базу                    |
| `npm run db:generate` | пересобрать клиент Prisma из схемы                            |
| `npm run db:migrate`  | создать и применить миграцию (dev)                            |
| `npm run db:deploy`   | применить готовые миграции без генерации новых (прод/CI)      |
| `npm run db:push`     | залить схему в базу без файла миграции (только для прототипов)|
| `npm run db:studio`   | Prisma Studio — веб-интерфейс к базе                          |

## Структура

```
prisma/
├─ schema.prisma                   схема БД (модели + индексы)
└─ migrations/                     версионированные SQL-миграции
generated/prisma/                  клиент Prisma (в git не хранится)
src/
├─ app/
│  ├─ api/auth/[...all]/route.ts   все эндпоинты Better Auth
│  ├─ dashboard/page.tsx           кабинет (только для авторизованных)
│  ├─ sign-in/page.tsx             вход
│  ├─ sign-up/page.tsx             регистрация
│  └─ page.tsx                     главная
├─ components/
│  ├─ auth-form.tsx                форма входа/регистрации (клиент)
│  ├─ sign-out-button.tsx
│  └─ site-header.tsx              шапка, знает про сессию
├─ dal/
│  └─ user.ts                      слой доступа к данным: все запросы в БД
└─ lib/
   ├─ auth.ts                      конфиг Better Auth (сервер)
   ├─ auth-client.ts               клиент Better Auth (браузер)
   ├─ prisma.ts                    инстанс PrismaClient
   └─ session.ts                   getSession() / requireSession()
prisma.config.ts                   конфиг Prisma CLI (читает .env.local)
```

## Как это работает

**Защита страниц** делается на сервере, в самих компонентах:

```ts
const session = await requireSession(); // нет сессии -> redirect на /sign-in
```

Это надёжнее проверки в middleware/proxy: авторизация выполняется там же, где читаются данные, и её нельзя обойти прямым запросом.

**Запросы к базе живут в `src/dal/`**, а не в компонентах страниц:

```ts
// src/dal/user.ts
import "server-only";
import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
```

Когда моделей станет больше, это единственное место, которое придётся править при смене схемы. Импорт `server-only` не даст утащить подключение к базе в браузер: такой код упадёт на сборке.

**Своя таблица:** описать модель в `prisma/schema.prisma` → `npm run db:migrate` → добавить запросы в `src/dal/`.

Пароли хранятся хешем (scrypt) в таблице `account`, сессии — в таблице `session`; кука подписана `BETTER_AUTH_SECRET`.

### Почему `@prisma/adapter-pg`

Prisma 7 больше не поставляет встроенный движок запросов — подключение к базе идёт через driver adapter. Здесь это node-postgres поверх обычного пула; настройки пула (уменьшенный `max` на serverless) — в `src/lib/prisma.ts`. Prisma Postgres подключается той же обычной `postgres://`-строкой, отдельный адаптер не нужен.

### Даты

Все даты объявлены как `@db.Timestamptz(3)`. Тип `timestamp` без таймзоны (умолчание Prisma) хранит «настенное» время без смещения, из-за чего момент времени уезжает, если процесс-читатель работает в другой таймзоне, чем писатель — например, локально CEST, а на Vercel UTC.

## Деплой на Vercel

1. **База.** Заведите базу через Storage → **Prisma Postgres** (есть бесплатный тариф). Интеграция сама пропишет `DATABASE_URL` — обычную `postgres://`-строку, которую наш `@prisma/adapter-pg` понимает без изменений. Пулинг соединений у Prisma Postgres встроенный, отдельный pgBouncer не нужен.

2. **Переменные окружения** в Project Settings → Environment Variables:

   | Переменная           | Значение                                                     | Окружения          |
   | -------------------- | ------------------------------------------------------------ | ------------------ |
ж   | `DATABASE_URL`       | строка подключения (ставит интеграция Prisma Postgres; её алиасы `POSTGRES_URL` / `PRISMA_DATABASE_URL` приложение тоже понимает) | все                |
   | `BETTER_AUTH_SECRET` | `openssl rand -base64 32` — **отдельный**, не локальный        | все                |
   | `BETTER_AUTH_URL`    | боевой домен, напр. `https://myapp.vercel.app`                 | только Production  |

   На Preview `BETTER_AUTH_URL` задавать не нужно: `src/lib/auth.ts` подхватит `VERCEL_URL`, и каждый превью-деплой заработает на своём домене. Один адрес на все окружения приведёт к `403 Invalid origin` на превью.

3. **Миграции.** Клиент Prisma генерируется при установке зависимостей (`postinstall`), но схему в боевой базе нужно создать:

   ```bash
   DATABASE_URL="postgres://...prod..." npx prisma migrate deploy
   ```

   Строку подключения берите ту же, что ставит интеграция (Vercel → Storage → база → `.env.local`-сниппет, или Prisma Console). Либо пропишите деплой миграций в сборку: `"build": "prisma migrate deploy && next build"`.

   **База осталась со времён Drizzle** (snake_case-колонки)? `migrate deploy` на непустой базе без истории Prisma упадёт с P3005. Init-миграция содержит путь апгрейда (переименует колонки, сохранит данные) — выполните её напрямую и пометьте применённой:

   ```bash
   DATABASE_URL="postgres://...prod..." npx prisma db execute --file prisma/migrations/20260725151202_init/migration.sql
   DATABASE_URL="postgres://...prod..." npx prisma migrate resolve --applied 20260725151202_init
   ```

## Что дальше

- **Rate limiting в БД.** Better Auth включает защиту от перебора в production, но хранит счётчики в памяти процесса — на serverless они теряются при каждом холодном старте. Лечится `rateLimit: { storage: "database" }` в `src/lib/auth.ts` плюс модель `RateLimit` в схеме.
- **Подтверждение почты и сброс пароля** — включить `requireEmailVerification` и подключить отправку писем (Resend, Postmark).
- **OAuth-провайдеры** — Better Auth добавляет GitHub/Google несколькими строками в `socialProviders`, модель `Account` под это уже готова.
- **`error.tsx`** — сейчас при недоступной базе пользователь увидит голый 500 без интерфейса.
- **Валидация форм** — Zod + react-hook-form.
