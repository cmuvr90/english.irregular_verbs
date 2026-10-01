import type { Metadata } from "next";

import { BackLink } from "@/components/admin/back-link";
import { GroupForm } from "@/components/admin/group-form";
import { PageHeader, PillTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Новая группа" };

export default async function NewGroupPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/groups">Группы</BackLink>}
        title={<PillTitle pre="новая" pill="группа" />}
      />
      <GroupForm id={null} values={{ key: "", name: {}, description: {} }} />
    </>
  );
}
