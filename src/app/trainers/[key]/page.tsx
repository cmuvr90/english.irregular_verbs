import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { FillBlanksTrainer } from "@/components/trainers/fill-blanks-trainer";
import { FlashcardsTrainer } from "@/components/trainers/flashcards-trainer";
import {
  MultipleChoiceTrainer,
  type ChoiceSentence,
} from "@/components/trainers/multiple-choice-trainer";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { defaultLocale, pickLocalized, type Locale } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { parseBlanks, validateSentence, type SentenceOptions } from "@/lib/sentence-options";
import { requireSession } from "@/lib/session";
import type { TrainerSettings } from "@/lib/trainer-settings";

type Props = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ group?: string }>;
};

const getTrainer = cache((key: string) => prisma.trainer.findUnique({ where: { key } }));

/**
 * settings хранится по локалям. Каркас (порядок шагов, иконки) и запасной
 * текст — из языка по умолчанию; поверх него кладём перевод текущего языка
 * поле за полем. Админка сохраняет пустыми непереведённые поля, поэтому
 * подстановка английского происходит здесь, при показе.
 */
function resolveSettings(settings: unknown, locale: Locale): TrainerSettings | null {
  if (!settings || typeof settings !== "object") return null;
  const map = settings as Record<string, Partial<TrainerSettings> | undefined>;
  const base = map[defaultLocale];
  if (!base || typeof base.hint !== "string" || !Array.isArray(base.steps)) return null;

  const localized = map[locale];
  const localizedSteps = Array.isArray(localized?.steps) ? localized.steps : [];
  return {
    hint: localized?.hint || base.hint,
    steps: base.steps.map((step, index) => ({
      ...step,
      name: localizedSteps[index]?.name || step.name,
      description: localizedSteps[index]?.description || step.description,
    })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const locale = await getLocale();
  const trainer = await getTrainer(key);
  if (!trainer) return {};
  return { title: pickLocalized(trainer.name, locale) };
}

/** Глаголы группы или все вперемешку — колода для тренажёра карточек. */
async function loadVerbs(groupKey: string | undefined) {
  if (!groupKey) return prisma.verb.findMany();

  const group = await prisma.verbGroup.findUnique({
    where: { key: groupKey },
    include: { verbs: { include: { verb: true } } },
  });
  if (!group) notFound();
  return group.verbs.map((link) => link.verb);
}

/** Опубликованные предложения — колода для тренажёра «Выбери форму». */
async function loadSentences(groupKey: string | undefined, locale: Locale) {
  if (groupKey) {
    const group = await prisma.verbGroup.findUnique({ where: { key: groupKey } });
    if (!group) notFound();
  }

  const rows = await prisma.verbSentence.findMany({
    where: {
      status: "published",
      ...(groupKey ? { verb: { groups: { some: { group: { key: groupKey } } } } } : {}),
    },
    select: {
      id: true,
      verbId: true,
      text: true,
      options: true,
      explanation: true,
      translation: true,
    },
  });

  return rows
    .filter((row) => {
      // Компонент рассчитан ровно на один пропуск: предложение с двумя
      // отсекаем здесь, а не ломаем им тренировку.
      if (parseBlanks(row.text).length !== 1) return false;

      // Содержимое options база не проверяет, а сид — не единственный, кто
      // пишет в таблицу. Строка без верного варианта отрисовалась бы обычным
      // заданием, где любой ответ неверен и глагол бесконечно откатывается в
      // «повторить», поэтому гоняем тот же валидатор, что и на записи.
      const problems = validateSentence(row.text, row.options);
      if (problems.length > 0) {
        // Молча пропавшее предложение потом не найти: пишем в лог сервера.
        console.warn(`Предложение ${row.id} пропущено: ${problems.join("; ")}`);
        return false;
      }
      return true;
    })
    .map(
      (row): ChoiceSentence => ({
        id: row.id,
        verbId: row.verbId,
        text: row.text,
        options: row.options as SentenceOptions,
        explanation: pickLocalized(row.explanation, locale),
        translation: pickLocalized(row.translation, locale),
      }),
    );
}

/** Прогресс студента по глаголам колоды. */
async function loadProgress(userId: string, trainerId: string, verbIds: string[]) {
  const rows = await prisma.trainerVerbProgress.findMany({
    where: { userId, trainerId, verbId: { in: verbIds } },
    select: { verbId: true, status: true, lastViewAt: true },
  });
  return rows.map((row) => ({
    verbId: row.verbId,
    status: row.status,
    lastViewAt: row.lastViewAt?.getTime() ?? null,
  }));
}

function navLabels(dict: Dictionary) {
  return {
    home: dict.dashboard.navHome,
    trainers: dict.dashboard.navTrainers,
    progress: dict.dashboard.navProgress,
    profile: dict.dashboard.navProfile,
  };
}

export default async function TrainerPage({ params, searchParams }: Props) {
  const session = await requireSession();
  const { key } = await params;
  const { group: groupKey } = await searchParams;
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.trainer;

  const trainer = await getTrainer(key);
  if (!trainer) notFound();

  // settings разбираются внутри веток, а не здесь: тренажёр без компонента
  // должен дойти до заглушки «скоро будет», и кривые (или пустые) настройки
  // не должны превращать её в 404. Ключи не выносим в отдельный список —
  // единственный источник правды о реализованных тренажёрах ниже.
  const title = pickLocalized(trainer.name, locale);
  const backHref = groupKey ? `/verbs/${groupKey}` : "/trainers";

  // Серверный компонент выполняется на каждый запрос: новое зерно — это новая
  // перемешанная колода, а клиент гидрирует её детерминированно.
  // eslint-disable-next-line react-hooks/purity
  const seed = Math.random();

  if (trainer.key === "flashcards") {
    const settings = resolveSettings(trainer.settings, locale);
    if (!settings) notFound();

    const verbs = await loadVerbs(groupKey);
    const progress = await loadProgress(
      session.user.id,
      trainer.id,
      verbs.map((verb) => verb.id),
    );

    return (
      <main className="flex-1 bg-white">
        <FlashcardsTrainer
          trainerId={trainer.id}
          title={title}
          settings={settings}
          verbs={verbs.map((verb) => ({
            id: verb.id,
            form1: verb.form1,
            form2: verb.form2,
            form3: verb.form3,
            translation: pickLocalized(verb.translation, locale),
          }))}
          progress={progress}
          labels={{
            howItWorks: t.howItWorks,
            showAnswer: t.showAnswer,
            know: t.know,
            repeat: t.repeat,
            finishTitle: t.finishTitle,
            finishText: t.finishText,
            again: t.again,
            empty: t.empty,
            back: t.back,
          }}
          backHref={backHref}
          seed={seed}
        />

        <BottomNav labels={navLabels(dict)} />
      </main>
    );
  }

  if (trainer.key === "multiple-choice") {
    const settings = resolveSettings(trainer.settings, locale);
    if (!settings) notFound();

    const sentences = await loadSentences(groupKey, locale);
    const progress = await loadProgress(
      session.user.id,
      trainer.id,
      sentences.map((sentence) => sentence.verbId),
    );

    return (
      <main className="flex-1 bg-white">
        <MultipleChoiceTrainer
          trainerId={trainer.id}
          title={title}
          settings={settings}
          sentences={sentences}
          progress={progress}
          labels={{
            howItWorks: t.howItWorks,
            correct: t.correct,
            correctCount: t.correctCount,
            wrong: t.wrong,
            correctAnswer: t.correctAnswer,
            why: t.why,
            sentenceTranslation: t.sentenceTranslation,
            next: t.next,
            mistakes: t.mistakes,
            finishTitle: t.finishTitle,
            scoreText: t.scoreText,
            again: t.again,
            empty: t.empty,
            back: t.back,
          }}
          backHref={backHref}
          seed={seed}
        />

        <BottomNav labels={navLabels(dict)} />
      </main>
    );
  }

  if (trainer.key === "fill-blanks") {
    const settings = resolveSettings(trainer.settings, locale);
    if (!settings) notFound();

    // Колода та же, что у карточек: все глаголы или глаголы группы.
    const verbs = await loadVerbs(groupKey);
    const progress = await loadProgress(
      session.user.id,
      trainer.id,
      verbs.map((verb) => verb.id),
    );

    return (
      <main className="flex-1 bg-white">
        <FillBlanksTrainer
          trainerId={trainer.id}
          title={title}
          settings={settings}
          verbs={verbs.map((verb) => ({
            id: verb.id,
            form1: verb.form1,
            form2: verb.form2,
            form3: verb.form3,
            translation: pickLocalized(verb.translation, locale),
          }))}
          progress={progress}
          labels={{
            howItWorks: t.howItWorks,
            fillPlaceholder: t.fillPlaceholder,
            check: t.check,
            yourAnswer: t.yourAnswer,
            correct: t.correct,
            wrong: t.wrong,
            correctAnswer: t.correctAnswer,
            next: t.next,
            finishTitle: t.finishTitle,
            scoreText: t.scoreText,
            correctCount: t.correctCount,
            mistakes: t.mistakes,
            again: t.again,
            empty: t.empty,
            back: t.back,
          }}
          backHref={backHref}
          seed={seed}
        />

        <BottomNav labels={navLabels(dict)} />
      </main>
    );
  }

  // Тренажёр есть в базе, но компонента под него ещё нет.
  redirect("/coming-soon");
}
