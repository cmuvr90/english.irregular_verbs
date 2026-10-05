import type { Metadata } from "next";

import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { TopBar } from "@/ui/composites/top-bar";
import { TrainerCard } from "@/ui/composites/trainer-card";
import { trainerLook } from "@/ui/trainer-icons";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.trainers };
}

export default async function TrainersPage() {
  await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.trainer;

  const trainers = await prisma.trainer.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="flex-1 bg-canvas">
      <TopBar
        back={{ href: "/dashboard", label: dict.verbGroups.backToDashboard }}
        title={t.listTitle}
        subtitle={t.listSubtitle}
      />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-4 pt-24 pb-32">
        <ul className="grid grid-cols-2 gap-3">
          {trainers.map((trainer) => {
            const { icon, tone } = trainerLook(trainer.key);
            return (
              <li key={trainer.id} className="flex">
                <TrainerCard
                  variant="tile"
                  href={`/trainers/${trainer.key}`}
                  name={pickLocalized(trainer.name, locale)}
                  description={pickLocalized(trainer.description, locale)}
                  icon={icon}
                  tone={tone}
                  illustration={{ src: `/images/app/trainer-${trainer.key}.webp`, alt: "" }}
                  className="w-full"
                />
              </li>
            );
          })}
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
