import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { countUsers, getUserById } from "@/dal/user";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Кабинет" };

export default async function DashboardPage() {
  const session = await requireSession();

  // Запросы идут через слой доступа к данным, а не напрямую из компонента.
  const [profile, total] = await Promise.all([
    getUserById(session.user.id),
    countUsers(),
  ]);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-subtle">Кабинет</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Привет, {session.user.name || session.user.email}
        </h1>
        <p className="mt-2 text-subtle">
          Эта страница доступна только авторизованным — сессия проверяется на сервере.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Card title="Профиль из базы">
            <Row label="ID" value={profile?.id ?? "—"} mono />
            <Row label="Имя" value={profile?.name ?? "—"} />
            <Row label="Почта" value={profile?.email ?? "—"} />
            <Row
              label="Почта подтверждена"
              value={profile?.emailVerified ? "да" : "нет"}
            />
            <Row
              label="Регистрация"
              value={profile ? profile.createdAt.toLocaleString("ru-RU") : "—"}
            />
          </Card>

          <Card title="Сессия">
            <Row label="Токен сессии" value={`${session.session.token.slice(0, 12)}…`} mono />
            <Row
              label="Действует до"
              value={new Date(session.session.expiresAt).toLocaleString("ru-RU")}
            />
            <Row label="Всего пользователей в БД" value={String(total)} />
          </Card>
        </div>

        <p className="mt-10 text-sm text-subtle">
          Дальше сюда можно добавлять свои таблицы в{" "}
          <code className="font-mono">src/db/schema.ts</code> и запросы через{" "}
          <code className="font-mono">db</code> из <code className="font-mono">@/db</code>.
        </p>
      </main>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <dl className="mt-4 space-y-2.5">{children}</dl>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="shrink-0 text-subtle">{label}</dt>
      <dd className={`truncate text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
