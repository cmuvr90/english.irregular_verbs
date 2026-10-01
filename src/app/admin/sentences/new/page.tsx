import type { Metadata } from "next";

import { SentenceForm } from "@/components/admin/sentence-form";
import { BackLink } from "@/components/admin/back-link";
import { PageHeader, PillTitle } from "@/components/admin/ui";
import { listVerbOptions } from "@/dal/admin";
import { searchParam } from "@/lib/admin-form";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Новое предложение" };

type Props = { searchParams: Promise<{ verb?: string | string[] }> };

export default async function NewSentencePage({ searchParams }: Props) {
  await requireAdmin();
  const verb = searchParam((await searchParams).verb);
  const verbs = await listVerbOptions();

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/sentences">Предложения</BackLink>}
        title={<PillTitle pre="новое" pill="предложение" />}
      />
      <SentenceForm
        id={null}
        values={{
          // ?verb=<id> приходит со страницы глагола; чужой id просто не выберется.
          verbId: verbs.some((v) => v.id === verb) ? verb : "",
          text: "",
          options: {},
          explanation: {},
          translation: {},
          level: 1,
          status: "draft",
          note: "",
        }}
        verbs={verbs.map((v) => ({ id: v.id, label: `${v.form1} · ${v.form2} · ${v.form3}` }))}
      />
    </>
  );
}
