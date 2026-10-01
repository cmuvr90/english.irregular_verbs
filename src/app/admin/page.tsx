import { PageHeader, PillTitle, Stat } from "@/components/admin/ui";
import { getAdminStats } from "@/dal/admin";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <>
      <PageHeader
        title={<PillTitle pre="irregular verbs" pill="обзор" />}
        description="Контент тренажёров и доступ пользователей. Правки видны студентам сразу после сохранения."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/admin/verbs" label="Глаголы" value={stats.verbs} />
        <Stat href="/admin/groups" label="Группы" value={stats.groups} />
        <Stat
          href="/admin/sentences"
          label="Предложения"
          value={stats.sentences}
          note={stats.drafts > 0 ? `черновиков: ${stats.drafts}` : "черновиков нет"}
        />
        <Stat
          href="/admin/users"
          label="Пользователи"
          value={stats.users}
          note={`админов: ${stats.admins}`}
        />
      </div>
    </>
  );
}
