import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized, plural } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { EmptyState } from "@/ui/composites/empty-state";
import { TopBar } from "@/ui/composites/top-bar";
import { VerbCard } from "@/ui/composites/verb-card";
import { IconTrainers, IconVerbs } from "@/ui/icons";
import { Badge } from "@/ui/primitives/badge";
import { buttonClass } from "@/ui/primitives/button-styles";

type Props = { params: Promise<{ key: string }> };

// `cache` схлопывает выборки generateMetadata и страницы в один запрос к БД.
const getGroup = cache((key: string) =>
  prisma.verbGroup.findUnique({
    where: { key },
    include: { verbs: { include: { verb: true } } },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const locale = await getLocale();
  const group = await getGroup(key);
  if (!group) return {};
  return { title: pickLocalized(group.name, locale) };
}

export default async function VerbGroupPage({ params }: Props) {
  await requireSession();
  const { key } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.verbGroups;

  const group = await getGroup(key);
  if (!group) notFound();

  const verbs = group.verbs
    .map((link) => link.verb)
    .sort((a, b) => a.form1.localeCompare(b.form1, "en"));

  return (
    <main className="flex-1 bg-canvas">
      <TopBar back={{ href: "/verbs", label: t.back }} title={pickLocalized(group.name, locale)} />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-4 pt-24 pb-32">
        <p className="t-body text-fg-muted">{pickLocalized(group.description, locale)}</p>
        <Badge tone="ink" icon={IconVerbs} className="mt-3">
          {plural(locale, verbs.length, t.count)}
        </Badge>

        {verbs.length > 0 && (
          <Link
            href={`/trainers/flashcards?group=${group.key}`}
            className={buttonClass({ variant: "primary", size: "lg", block: true, className: "mt-5" })}
          >
            <IconTrainers size={20} weight="bold" aria-hidden />
            {dict.trainer.practice}
          </Link>
        )}

        {verbs.length === 0 ? (
          <EmptyState title={t.empty} className="mt-5" />
        ) : (
          <ul className="mt-6 flex flex-col gap-2.5">
            {verbs.map((verb) => (
              <li key={verb.id}>
                <VerbCard
                  variant="compact"
                  forms={{ v1: verb.form1, v2: verb.form2, v3: verb.form3 }}
                  translation={pickLocalized(verb.translation, locale)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav
        labels={{
          home: dict.dashboard.navHome,
          trainers: dict.dashboard.navTrainers,
          progress: dict.dashboard.navProgress,
          profile: dict.dashboard.navProfile,
        }}
      />
    </main>
  );
}
