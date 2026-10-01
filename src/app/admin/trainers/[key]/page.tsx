import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/admin/back-link";
import { TrainerForm, type TrainerStepValue } from "@/components/admin/trainer-form";
import { buttonClass, Card, PageHeader, PillTitle } from "@/components/admin/ui";
import { getTrainerByKey } from "@/dal/admin";
import { toLocalizedMap } from "@/lib/admin-form";
import { guideFor, sectionLinks } from "@/lib/admin-trainers";
import { defaultLocale, locales, pickLocalized, type Locale } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";
import type { TrainerSettings } from "@/lib/trainer-settings";

export const metadata: Metadata = { title: "Тренажёр" };

type Props = { params: Promise<{ key: string }> };

/**
 * settings хранятся по локалям: {"ru": {hint, steps}}. Форма редактирует
 * шаги как общий список (порядок и иконка — из английской версии), а тексты
 * раскладывает по языкам по позиции шага.
 */
function toFormValues(settings: unknown) {
  const map =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? (settings as Partial<Record<Locale, Partial<TrainerSettings>>>)
      : {};

  const hint: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    const value = map[locale]?.hint;
    if (typeof value === "string") hint[locale] = value;
  }

  const base = Array.isArray(map[defaultLocale]?.steps) ? map[defaultLocale]!.steps! : [];
  const steps: TrainerStepValue[] = base.map((step, index) => {
    const name: Partial<Record<Locale, string>> = {};
    const description: Partial<Record<Locale, string>> = {};
    for (const locale of locales) {
      const localized = Array.isArray(map[locale]?.steps) ? map[locale]!.steps![index] : undefined;
      if (localized?.name) name[locale] = localized.name;
      if (localized?.description) description[locale] = localized.description;
    }
    return { icon: String(step.icon ?? ""), name, description };
  });

  return { hint, steps };
}

export default async function EditTrainerPage({ params }: Props) {
  await requireAdmin();
  const { key } = await params;
  const trainer = await getTrainerByKey(key);
  if (!trainer) notFound();

  const guide = guideFor(trainer.key);
  const { hint, steps } = toFormValues(trainer.settings);

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/trainers">Тренажёры</BackLink>}
        title={<PillTitle pre="тренажёр" pill={pickLocalized(trainer.name, "ru")} />}
        description={guide?.summary}
        actions={
          <a
            href={`/trainers/${encodeURIComponent(trainer.key)}`}
            target="_blank"
            rel="noreferrer"
            className={buttonClass.outline}
          >
            Открыть в приложении
            <ArrowUpRight />
          </a>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <TrainerForm
          id={trainer.id}
          hintPlace={guide?.hintPlace ?? "на экране тренировки"}
          values={{
            name: toLocalizedMap(trainer.name),
            description: toLocalizedMap(trainer.description),
            hint,
            steps,
          }}
        />

        <Card
          title="Задания — не здесь"
          description="Эта страница меняет только тексты интерфейса. Сами задания тренажёр берёт из разделов контента."
        >
          {guide ? (
            <div className="flex flex-col gap-3">
              <p>{guide.deck}</p>
              <ul className="flex flex-col divide-y divide-line rounded-lg ring-1 ring-line">
                {guide.sources.map((source) => (
                  <li key={source.section}>
                    <Link
                      href={sectionLinks[source.section].href}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {sectionLinks[source.section].label}
                        </span>
                        <span className="block text-xs text-subtle">{source.what}</span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-amber-800">
              Компонента под этот тренажёр нет — студент увидит заглушку «Скоро».
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
