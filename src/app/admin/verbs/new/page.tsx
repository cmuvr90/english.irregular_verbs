import type { Metadata } from "next";

import { BackLink } from "@/components/admin/back-link";
import { PageHeader, PillTitle } from "@/components/admin/ui";
import { VerbForm } from "@/components/admin/verb-form";
import { listGroups } from "@/dal/admin";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Новый глагол" };

export default async function NewVerbPage() {
  await requireAdmin();
  const groups = await listGroups();

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/verbs">Глаголы</BackLink>}
        title={<PillTitle pre="новый" pill="глагол" />}
      />
      <VerbForm
        id={null}
        values={{ form1: "", form2: "", form3: "", translation: {}, groupIds: [] }}
        groups={groups.map((g) => ({ id: g.id, key: g.key, name: pickLocalized(g.name, "ru") }))}
      />
    </>
  );
}
