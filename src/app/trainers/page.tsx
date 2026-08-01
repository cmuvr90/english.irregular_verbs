import { ChevronRight, Dumbbell, WalletCards, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.trainers };
}

/** Иконка тренажёра по его key; для новых тренажёров — нейтральный фолбэк. */
const trainerIcons: Record<string, LucideIcon> = {
  flashcards: WalletCards,
};

export default async function TrainersPage() {
  await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.trainer;

  const trainers = await prisma.trainer.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="flex-1 bg-white">
      <AppHeader
        backHref="/dashboard"
        backLabel={dict.verbGroups.backToDashboard}
        title={t.listTitle}
        subtitle={t.listSubtitle}
      />

      <div className="mx-auto w-full max-w-md px-5 pt-32 pb-28">
        <ul className="flex flex-col gap-3">
          {trainers.map((trainer) => {
            const TrainerIcon = trainerIcons[trainer.key] ?? Dumbbell;
            return (
            <li key={trainer.id}>
              <Link
                href={`/trainers/${trainer.key}`}
                className="flex items-center gap-4 rounded-3xl border border-line/60 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <TrainerIcon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {pickLocalized(trainer.name, locale)}
                  </span>
                  <span className="mt-0.5 block text-sm text-subtle">
                    {pickLocalized(trainer.description, locale)}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-subtle" />
              </Link>
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
