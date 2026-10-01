import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/admin/back-link";
import { DeleteButton } from "@/components/admin/form-fields";
import { GroupForm } from "@/components/admin/group-form";
import { Card, PageHeader, PillTitle } from "@/components/admin/ui";
import { getGroup } from "@/dal/admin";
import { deleteGroup } from "@/lib/admin-actions";
import { toLocalizedMap } from "@/lib/admin-form";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Группа" };

type Props = { params: Promise<{ id: string }> };

export default async function EditGroupPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  const verbs = group.verbs
    .map((link) => link.verb)
    .sort((a, b) => a.form1.localeCompare(b.form1, "en"));

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/groups">Группы</BackLink>}
        title={<PillTitle pre="группа" pill={pickLocalized(group.name, "ru")} />}
        actions={
          <DeleteButton
            action={deleteGroup.bind(null, group.id)}
            confirmText={`Удалить группу «${group.key}»? Глаголы останутся, пропадёт только группировка.`}
          />
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <GroupForm
          id={group.id}
          values={{
            key: group.key,
            name: toLocalizedMap(group.name),
            description: toLocalizedMap(group.description),
          }}
        />

        <Card
          title={`Глаголы · ${verbs.length}`}
          description="Состав группы меняется на странице глагола."
        >
          <ul className="flex flex-col gap-1">
            {verbs.map((verb) => (
              <li key={verb.id}>
                <Link href={`/admin/verbs/${verb.id}`} className="hover:underline">
                  <span className="font-semibold text-blue-600">{verb.form1}</span> · {verb.form2}{" "}
                  · {verb.form3}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
