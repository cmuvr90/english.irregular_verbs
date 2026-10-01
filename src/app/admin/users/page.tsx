import type { Metadata } from "next";
import Link from "next/link";

import {
  Badge,
  buttonClass,
  EmptyRow,
  FilterBar,
  filterSelectClass,
  PageHeader,
  PillTitle,
  TableCard,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/admin/ui";
import { getUsersActivity, listUsers, STATS_DAYS, STATS_TIME_ZONE, USERS_LIMIT } from "@/dal/admin";
import { setUserRole } from "@/lib/admin-actions";
import { searchParam } from "@/lib/admin-form";
import { accuracy } from "@/lib/admin-stats";
import { roles } from "@/lib/roles";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Пользователи" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

const dateFormat = new Intl.DateTimeFormat("ru", { dateStyle: "medium", timeZone: STATS_TIME_ZONE });

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await requireAdmin();
  const q = searchParam((await searchParams).q);
  const users = await listUsers(q);
  const activity = await getUsersActivity(users.map((user) => user.id));

  return (
    <>
      <PageHeader
        overline="Доступ"
        title={<PillTitle pre="все" pill="пользователи" />}
        description="Нажмите на пользователя, чтобы увидеть графики занятий и его ошибки. Роль admin открывает эту админку и действует сразу. Последнего админа разжаловать нельзя."
      >
        <FilterBar
          query={q}
          placeholder="Поиск по имени или почте"
          summary={
            users.length === USERS_LIMIT
              ? `Показаны последние ${USERS_LIMIT} — уточните поиск, чтобы найти остальных`
              : `Найдено: ${users.length}`
          }
        />
      </PageHeader>

      <TableCard>
        <THead>
          <Th>Пользователь</Th>
          <Th>Последнее занятие</Th>
          <Th className="text-right">Выучено</Th>
          <Th className="text-right">Точность</Th>
          <Th className="text-right">Ошибок за {STATS_DAYS} дн.</Th>
          <Th>Роль</Th>
        </THead>
        <TBody>
          {users.length === 0 ? (
            <EmptyRow colSpan={6}>Ничего не нашлось.</EmptyRow>
          ) : (
            users.map((user) => {
              const isSelf = user.id === session.user.id;
              const stats = activity.get(user.id)!;
              const acc = accuracy(stats.know, stats.repeat);
              return (
                <tr key={user.id}>
                  <Td>
                    <Link href={`/admin/users/${user.id}`} className="group block">
                      <span className="block font-semibold group-hover:underline">
                        {user.name || "—"}
                      </span>
                      <span className="block text-xs text-subtle">
                        {user.email} · с {dateFormat.format(user.createdAt)}
                      </span>
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-subtle">
                    {stats.lastActiveAt ? dateFormat.format(stats.lastActiveAt) : "не занимался"}
                  </Td>
                  <Td className="text-right font-mono text-xs tabular-nums">{stats.learned}</Td>
                  <Td className="text-right font-mono text-xs tabular-nums">
                    {acc === null ? "—" : `${acc}%`}
                  </Td>
                  <Td className="text-right font-mono text-xs tabular-nums">{stats.mistakes30}</Td>
                  <Td>
                    {isSelf ? (
                      // Свою роль не меняем — см. setUserRole.
                      <Badge tone={user.role}>{user.role} · вы</Badge>
                    ) : (
                      <form action={setUserRole.bind(null, user.id)} className="flex items-center gap-1.5">
                        <select
                          name="role"
                          defaultValue={user.role}
                          aria-label="Роль"
                          className={filterSelectClass}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={buttonClass.outline}>
                          Сохранить
                        </button>
                      </form>
                    )}
                  </Td>
                </tr>
              );
            })
          )}
        </TBody>
      </TableCard>
    </>
  );
}
