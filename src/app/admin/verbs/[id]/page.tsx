import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/admin/back-link";
import { DeleteButton } from "@/components/admin/form-fields";
import { Badge, buttonClass, Card, PageHeader, PillTitle } from "@/components/admin/ui";
import { VerbAudioForm } from "@/components/admin/verb-audio-form";
import { VerbForm } from "@/components/admin/verb-form";
import { VerbImageForm } from "@/components/admin/verb-image-form";
import { getVerb, listGroups } from "@/dal/admin";
import { deleteVerb } from "@/lib/admin-actions";
import { sentenceStatusLabels, toLocalizedMap } from "@/lib/admin-form";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Глагол" };

type Props = { params: Promise<{ id: string }> };

export default async function EditVerbPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const [verb, groups] = await Promise.all([getVerb(id), listGroups()]);
  if (!verb) notFound();

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/verbs">Глаголы</BackLink>}
        title={<PillTitle pill={verb.form1} post={`${verb.form2} ${verb.form3}`} />}
        actions={
          <DeleteButton
            action={deleteVerb.bind(null, verb.id)}
            confirmText={`Удалить «${verb.form1}»? Вместе с ним удалятся его предложения и прогресс студентов.`}
          />
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <VerbForm
          id={verb.id}
          values={{
            form1: verb.form1,
            form2: verb.form2,
            form3: verb.form3,
            translation: toLocalizedMap(verb.translation),
            groupIds: verb.groups.map((link) => link.verbGroupId),
          }}
          groups={groups.map((g) => ({ id: g.id, key: g.key, name: pickLocalized(g.name, "ru") }))}
        />

        <div className="flex flex-col gap-6">
          <VerbImageForm
            verbId={verb.id}
            imageUrl={verb.imageUrl}
            verbLabel={`${verb.form1} – ${verb.form2} – ${verb.form3}`}
          />
          <VerbAudioForm
            verbId={verb.id}
            infinitive={verb.form1}
            forms={[
              { text: verb.form1, audioUrl: verb.audio1Url },
              { text: verb.form2, audioUrl: verb.audio2Url },
              { text: verb.form3, audioUrl: verb.audio3Url },
            ]}
          />
          <Card
            title="Предложения"
            description="Тренажёры «Выбери форму» и «Расставь слова»"
            action={
              <Link href={`/admin/sentences/new?verb=${verb.id}`} className={buttonClass.link}>
                Добавить
              </Link>
            }
          >
            {verb.sentences.length === 0 ? (
              <p className="text-subtle">Пока нет.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {verb.sentences.map((sentence) => (
                  <li key={sentence.id} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
                    <Link href={`/admin/sentences/${sentence.id}`} className="hover:underline">
                      {sentence.text}
                    </Link>
                    <Badge tone={sentence.status}>{sentenceStatusLabels[sentence.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
