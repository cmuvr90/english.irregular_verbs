import { MoveRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized, plural } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

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
    <main className="flex-1 bg-white">
      <AppHeader
        backHref="/verbs"
        backLabel={t.back}
        title={pickLocalized(group.name, locale)}
      />

      {/* pt-24 освобождает место под фиксированную шапку, pb-28 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-5 pt-24 pb-28">
        <p className="text-subtle">{pickLocalized(group.description, locale)}</p>
        <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-medium text-blue-600">
          {plural(locale, verbs.length, t.count)}
        </p>

        {verbs.length === 0 ? (
          <p className="mt-5 rounded-3xl border border-line/60 bg-white p-5 text-center text-subtle">
            {t.empty}
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-line/60 rounded-3xl border border-line/60 bg-white px-5">
            {verbs.map((verb) => (
              <li key={verb.id} className="py-3.5">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold">
                  <span className="text-blue-600">{verb.form1}</span>
                  <MoveRight size={14} className="shrink-0 text-subtle" />
                  <span>{verb.form2}</span>
                  <MoveRight size={14} className="shrink-0 text-subtle" />
                  <span>{verb.form3}</span>
                </p>
                <p className="mt-0.5 text-sm text-subtle">
                  {pickLocalized(verb.translation, locale)}
                </p>
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
