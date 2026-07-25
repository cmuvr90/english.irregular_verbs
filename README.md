# Next.js Starter — Postgres + Drizzle + Better Auth + Tailwind

Болванка для быстрого старта: авторизация по почте и паролю, база в Docker для локальной разработки, деплой на Vercel.

## Стек

| Слой        | Технология                                                       |
| ----------- | ---------------------------------------------------------------- |
| Фреймворк   | Next.js 16 (App Router, Turbopack), React 19                      |
| База        | PostgreSQL 17 — локально в Docker, на проде Neon/Vercel Postgres  |
| ORM         | Drizzle ORM + drizzle-kit (миграции), драйвер `pg`                |
| Авторизация | Better Auth — email + пароль, сессии в БД                         |
| Стили       | Tailwind CSS v4                                                   |

## Быстрый старт

```bash
# 1. Зависимости
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

| Команда               | Что делает                                              |
| --------------------- | ------------------------------------------------------- |
| `npm run dev`         | dev-сервер                                              |
| `npm run build`       | production-сборка                                       |
| `npm run db:up`       | поднять Postgres в Docker                               |
| `npm run db:down`     | остановить контейнер (данные остаются в volume)         |
| `npm run db:reset`    | снести том с данными и поднять чистую базу              |
| `npm run db:generate` | сгенерировать SQL-миграцию из `src/db/schema.ts`        |
| `npm run db:migrate`  | применить миграции                                      |
| `npm run db:push`     | залить схему в базу без файла миграции (только для dev) |
| `npm run db:studio`   | Drizzle Studio — веб-интерфейс к базе                   |

## Структура

```
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
├─ db/
│  ├─ index.ts                     пул соединений + инстанс Drizzle
│  └─ schema.ts                    таблицы user, session, account, verification
└─ lib/
   ├─ auth.ts                      конфиг Better Auth (сервер)
   ├─ auth-client.ts               клиент Better Auth (браузер)
   └─ session.ts                   getSession() / requireSession()
drizzle/                           сгенерированные SQL-миграции
```

## Как это работает

**Защита страниц** делается на сервере, в самих компонентах:

```ts
const session = await requireSession(); // нет сессии -> redirect на /sign-in
```

Это надёжнее проверки в middleware/proxy: авторизация выполняется там же, где читаются данные, и её нельзя обойти прямым запросом.

**Работа с базой:**

```ts
import { db } from "@/db";
import { user } from "@/db/schema";

const users = await db.select().from(user).limit(10);
```

**Своя таблица:** описать в `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate`.

Пароли хранятся хешем (scrypt) в таблице `account`, сессии — в таблице `session`; кука подписана `BETTER_AUTH_SECRET`.

## Деплой на Vercel

1. **База.** Vercel не хостит Postgres сам — заведите managed-базу: Neon (есть интеграция в маркетплейсе Vercel), Vercel Postgres или Supabase. Строка подключения должна содержать `?sslmode=require`.

2. **Переменные окружения** в Project Settings → Environment Variables:

   | Переменная           | Значение                                                     |
   | -------------------- | ------------------------------------------------------------ |
   | `DATABASE_URL`       | строка подключения к managed-базе                             |
   | `BETTER_AUTH_SECRET` | `openssl rand -base64 32` — **отдельный**, не локальный       |
   | `BETTER_AUTH_URL`    | боевой домен, напр. `https://myapp.vercel.app`                |

   Для Preview-деплоев `BETTER_AUTH_URL` можно не задавать — `src/lib/auth.ts` подхватит `VERCEL_URL`. Для Production домен нужно указать явно: по нему проверяется Origin запросов, и запрос с чужого домена получит `403 Invalid origin`.

3. **Миграции.** Перед первым деплоем накатите их на боевую базу:

   ```bash
   DATABASE_URL="postgres://...prod..." npx drizzle-kit migrate
   ```

   Либо пропишите их в сборку: `"build": "drizzle-kit migrate && next build"` — тогда миграции применяются на каждом деплое.

4. Импортируйте репозиторий в Vercel и деплойте — фреймворк определится сам.

## Что дальше

- **Подтверждение почты и сброс пароля** — включить `requireEmailVerification` в `src/lib/auth.ts` и подключить отправку писем (Resend, Postmark).
- **OAuth-провайдеры** — Better Auth добавляет GitHub/Google несколькими строками в `socialProviders`, таблица `account` под это уже готова.
- **Валидация форм** — Zod + react-hook-form.
- **Роли и права** — плагин `admin` из Better Auth.
