import { ArrowUpRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { TrainerIcon } from "@/components/admin/trainer-icon";
import { Badge, buttonClass, PageHeader, PillTitle } from "@/components/admin/ui";
import { getTrainerContentStats, listTrainers } from "@/dal/admin";
import { guideFor, sectionLinks, type ContentSection } from "@/lib/admin-trainers";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Тренажёры" };

export default async function AdminTrainersPage() {
  await requireAdmin();
  const [trainers, stats] = await Promise.all([listTrainers(), getTrainerContentStats()]);

  const counts: Record<ContentSection, string> = {
    verbs: `${stats.verbs}`,
    groups: `${stats.groups}`,
    sentences: `${stats.published} опубл.`,
  };

  return (
    <>
      <PageHeader
        overline="Тренажёры"
        title={<PillTitle pre="что и где" pill="настраивается" />}
        description="У каждого тренажёра две части: тексты интерфейса (редактируются на странице тренажёра) и задания, которые он берёт из разделов контента."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {trainers.map((trainer) => {
          const guide = guideFor(trainer.key);
          return (
            <section
              key={trainer.id}
              className="flex flex-col gap-4 rounded-xl bg-white p-4 text-sm ring-1 ring-foreground/10"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <TrainerIcon trainerKey={trainer.key} className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base leading-snug font-bold">
                      {pickLocalized(trainer.name, "ru")}
                    </h2>
                    <Badge tone="mono">{trainer.key}</Badge>
                  </div>
                  <p className="text-subtle">
                    {guide?.summary ?? pickLocalized(trainer.description, "ru")}
                  </p>
                </div>
              </div>

              {guide ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-subtle">Колода</span>
                    <p>{guide.deck}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-subtle">Задания берёт из</span>
                    <ul className="flex flex-col divide-y divide-line rounded-lg ring-1 ring-line">
                      {guide.sources.map((source) => (
                        <li key={source.section}>
                          <Link
                            href={sectionLinks[source.section].href}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">
                                {sectionLinks[source.section].label}
                              </span>
                              <span className="block text-xs text-subtle">{source.what}</span>
                            </span>
                            <span className="shrink-0 font-mono text-xs text-subtle tabular-nums">
                              {counts[source.section]}
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-subtle" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                  Под этот тренажёр нет компонента в приложении — студент увидит заглушку «Скоро».
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <span className="text-xs text-subtle">
                  Занимались: {stats.students.get(trainer.id) ?? 0}
                </span>
                <span className="flex items-center gap-2">
                  <a
                    href={`/trainers/${encodeURIComponent(trainer.key)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonClass.outline}
                  >
                    В приложении
                    <ArrowUpRight />
                  </a>
                  <Link href={`/admin/trainers/${encodeURIComponent(trainer.key)}`} className={buttonClass.primary}>
                    Тексты и инструкция
                  </Link>
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
