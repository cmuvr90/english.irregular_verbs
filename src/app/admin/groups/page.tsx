import type { Metadata } from "next";
import Link from "next/link";

import {
  Badge,
  EmptyRow,
  NewLink,
  PageHeader,
  PillTitle,
  TableCard,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/admin/ui";
import { UsedBy } from "@/components/admin/used-by";
import { listGroups } from "@/dal/admin";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Группы" };

export default async function AdminGroupsPage() {
  await requireAdmin();
  const groups = await listGroups();

  return (
    <>
      <PageHeader
        overline="Контент"
        title={<PillTitle pre="группы" pill="глаголов" />}
        description="Подборки на странице «Глаголы» и колоды тренажёров. Порядок — по дате создания."
        actions={<NewLink href="/admin/groups/new">Новая группа</NewLink>}
      >
        <UsedBy section="groups" />
      </PageHeader>

      <TableCard>
        <THead>
          <Th>Название (RU)</Th>
          <Th>Ключ</Th>
          <Th className="text-right">Глаголов</Th>
        </THead>
        <TBody>
          {groups.length === 0 ? (
            <EmptyRow colSpan={3}>Групп пока нет.</EmptyRow>
          ) : (
            groups.map((group) => (
              <tr key={group.id}>
                <Td>
                  <Link href={`/admin/groups/${group.id}`} className="font-semibold hover:underline">
                    {pickLocalized(group.name, "ru")}
                  </Link>
                </Td>
                <Td>
                  <Badge tone="mono">{group.key}</Badge>
                </Td>
                <Td className="text-right font-mono text-xs tabular-nums">{group._count.verbs}</Td>
              </tr>
            ))
          )}
        </TBody>
      </TableCard>
    </>
  );
}
