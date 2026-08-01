import { ChevronRight, List } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized, plural } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.verbGroups };
}

// Палитра чипов повторяет карточки быстрого доступа кабинета.
const chips = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-violet-100 text-violet-600",
  "bg-orange-100 text-orange-500",
  "bg-rose-100 text-rose-500",
  "bg-cyan-100 text-cyan-600",
];

/** Цвет чипа привязан к key группы, а не к позиции — не «переезжает» при смене порядка. */
function chipFor(key: string) {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return chips[Math.abs(hash) % chips.length];
}

export default async function VerbGroupsPage() {
  await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.verbGroups;

  // createdAt повторяет порядок сида — от простых паттернов к особым случаям.
  const groups = await prisma.verbGroup.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { verbs: true } } },
  });

  return (
    <main className="flex-1 bg-white">
      <AppHeader
        backHref="/dashboard"
        backLabel={t.backToDashboard}
        title={t.title}
        subtitle={t.subtitle}
      />

      {/* pt-32 освобождает место под фиксированную шапку, pb-28 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-5 pt-32 pb-28">
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/verbs/${group.key}`}
                className="flex items-center gap-4 rounded-3xl border border-line/60 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${chipFor(group.key)}`}
                >
                  <List size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {pickLocalized(group.name, locale)}
                  </span>
                  <span className="mt-0.5 block text-sm text-subtle">
                    {plural(locale, group._count.verbs, t.count)}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
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
