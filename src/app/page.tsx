import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";

const stack = [
  { name: "Next.js 16", note: "App Router, React 19, серверные компоненты" },
  { name: "PostgreSQL 17", note: "локально в Docker, на проде — Prisma Postgres" },
  { name: "Prisma 7", note: "декларативная схема, миграции, Prisma Studio" },
  { name: "Better Auth", note: "вход по почте и паролю, сессии хранятся в БД" },
  { name: "Tailwind CSS v4", note: "стили без конфига, темы через CSS-переменные" },
];

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-subtle">
          Стартовый шаблон
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Next.js + Postgres + Auth
        </h1>
        <p className="mt-4 max-w-2xl text-subtle">
          Болванка с подключением к базе, миграциями и авторизацией по почте и паролю.
          Локально база поднимается в Docker, деплой — на Vercel.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Перейти в кабинет
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Создать аккаунт
              </Link>
              <Link
                href="/sign-in"
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Войти
              </Link>
            </>
          )}
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {stack.map((item) => (
            <li key={item.name} className="bg-card p-5">
              <h2 className="font-medium">{item.name}</h2>
              <p className="mt-1 text-sm text-subtle">{item.note}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-subtle">
          Старт: <code className="font-mono">npm run db:up</code> →{" "}
          <code className="font-mono">npm run db:migrate</code> →{" "}
          <code className="font-mono">npm run dev</code>
        </div>
      </footer>
    </>
  );
}
