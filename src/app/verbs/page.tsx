import type { Metadata } from "next";

import { AdminLink } from "@/components/admin-link";
import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized, plural } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { ListLink } from "@/ui/composites/list-link";
import { TopBar } from "@/ui/composites/top-bar";
import { IconVerbs } from "@/ui/icons";
import type { Tone } from "@/ui/tones";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.verbGroups };
}

// Тоны дизайн-системы для плашек групп.
const tones: Tone[] = ["v1", "v2", "v3", "ink", "success", "gold"];

/** Тон привязан к key группы, а не к позиции — не «переезжает» при смене порядка. */
function toneFor(key: string) {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
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
    <main className="flex-1 bg-canvas">
      <TopBar
        back={{ href: "/dashboard", label: t.backToDashboard }}
        title={t.title}
        subtitle={t.subtitle}
        actions={<AdminLink label={dict.common.admin} />}
      />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-4 pt-24 pb-32">
        <ul className="flex flex-col gap-3">
          {groups.map((group) => (
            <li key={group.id}>
              <ListLink
                href={`/verbs/${group.key}`}
                icon={IconVerbs}
                tone={toneFor(group.key)}
                title={pickLocalized(group.name, locale)}
                description={plural(locale, group._count.verbs, t.count)}
              />
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
