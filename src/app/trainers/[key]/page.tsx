import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { BottomNav } from "@/components/bottom-nav";
import {
  FlashcardsTrainer,
  type FlashcardsSettings,
} from "@/components/trainers/flashcards-trainer";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { defaultLocale, pickLocalized } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

type Props = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ group?: string }>;
};

const getTrainer = cache((key: string) => prisma.trainer.findUnique({ where: { key } }));

/** settings хранится по локалям; берём текущую, иначе — язык по умолчанию. */
function resolveSettings(settings: unknown, locale: string): FlashcardsSettings | null {
  if (!settings || typeof settings !== "object") return null;
  const map = settings as Record<string, FlashcardsSettings | undefined>;
  const resolved = map[locale] ?? map[defaultLocale];
  if (!resolved || typeof resolved.hint !== "string" || !Array.isArray(resolved.steps)) {
    return null;
  }
  return resolved;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const locale = await getLocale();
  const trainer = await getTrainer(key);
  if (!trainer) return {};
  return { title: pickLocalized(trainer.name, locale) };
}

export default async function TrainerPage({ params, searchParams }: Props) {
  const session = await requireSession();
  const { key } = await params;
  const { group: groupKey } = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const trainer = await getTrainer(key);
  if (!trainer) notFound();
  // Компонент карточек заточен ровно под этот тренажёр; для будущих типов
  // тренажёров здесь появятся свои компоненты.
  if (trainer.key !== "flashcards") redirect("/coming-soon");

  const settings = resolveSettings(trainer.settings, locale);
  if (!settings) notFound();

  // Список глаголов: группа из query-параметра или все вперемешку.
  let verbs;
  let backHref = "/trainers";
  if (groupKey) {
    const group = await prisma.verbGroup.findUnique({
      where: { key: groupKey },
      include: { verbs: { include: { verb: true } } },
    });
    if (!group) notFound();
    verbs = group.verbs.map((link) => link.verb);
    backHref = `/verbs/${group.key}`;
  } else {
    verbs = await prisma.verb.findMany();
  }

  const progress = await prisma.trainerVerbProgress.findMany({
    where: {
      userId: session.user.id,
      trainerId: trainer.id,
      verbId: { in: verbs.map((v) => v.id) },
    },
    select: { verbId: true, status: true, lastViewAt: true },
  });

  return (
    <main className="flex-1 bg-white">
      <FlashcardsTrainer
        trainerId={trainer.id}
        title={pickLocalized(trainer.name, locale)}
        settings={settings}
        verbs={verbs.map((verb) => ({
          id: verb.id,
          form1: verb.form1,
          form2: verb.form2,
          form3: verb.form3,
          translation: pickLocalized(verb.translation, locale),
        }))}
        progress={progress.map((p) => ({
          verbId: p.verbId,
          status: p.status,
          lastViewAt: p.lastViewAt?.getTime() ?? null,
        }))}
        labels={{
          howItWorks: dict.trainer.howItWorks,
          showAnswer: dict.trainer.showAnswer,
          know: dict.trainer.know,
          repeat: dict.trainer.repeat,
          finishTitle: dict.trainer.finishTitle,
          finishText: dict.trainer.finishText,
          again: dict.trainer.again,
          empty: dict.trainer.empty,
          back: dict.trainer.back,
        }}
        backHref={backHref}
        // Серверный компонент выполняется на каждый запрос: новое зерно — это
        // новая перемешанная колода, а клиент гидрирует её детерминированно.
        // eslint-disable-next-line react-hooks/purity
        seed={Math.random()}
      />

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
