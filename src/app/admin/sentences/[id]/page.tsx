import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeleteButton } from "@/components/admin/form-fields";
import { SentenceForm } from "@/components/admin/sentence-form";
import { BackLink } from "@/components/admin/back-link";
import { PageHeader, PillTitle } from "@/components/admin/ui";
import { getSentence, listVerbOptions, STATS_TIME_ZONE } from "@/dal/admin";
import { deleteSentence } from "@/lib/admin-actions";
import { toLocalizedMap } from "@/lib/admin-form";
import type { SentenceOptions } from "@/lib/sentence-options";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Предложение" };

type Props = { params: Promise<{ id: string }> };

const dateFormat = new Intl.DateTimeFormat("ru", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: STATS_TIME_ZONE,
});

/** options из jsonb: форму проверит validateSentence при сохранении, тут — только тип. */
function toOptions(value: unknown): SentenceOptions {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as SentenceOptions)
    : {};
}

export default async function EditSentencePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [sentence, verbs] = await Promise.all([getSentence(id), listVerbOptions()]);
  if (!sentence) notFound();

  const author = sentence.createdBy?.name || sentence.createdBy?.email;
  const editor = sentence.updatedBy?.name || sentence.updatedBy?.email;

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/sentences">Предложения</BackLink>}
        title={<PillTitle pre="редактор" pill="предложения" />}
        description={
          `Создано ${dateFormat.format(sentence.createdAt)}${author ? ` (${author})` : " (сид)"}` +
          ` · изменено ${dateFormat.format(sentence.updatedAt)}${editor ? ` (${editor})` : ""}`
        }
        actions={
          <DeleteButton
            action={deleteSentence.bind(null, sentence.id)}
            confirmText="Удалить предложение? Если его уже видели студенты, лучше перевести в архив."
          />
        }
      />

      <SentenceForm
        id={sentence.id}
        values={{
          verbId: sentence.verbId,
          text: sentence.text,
          options: toOptions(sentence.options),
          explanation: toLocalizedMap(sentence.explanation),
          translation: toLocalizedMap(sentence.translation),
          level: sentence.level,
          status: sentence.status,
          note: sentence.note ?? "",
        }}
        verbs={verbs.map((v) => ({ id: v.id, label: `${v.form1} · ${v.form2} · ${v.form3}` }))}
      />
    </>
  );
}
