"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { SentenceOption } from "@/lib/sentence-options";
import { getSession } from "@/lib/session";

/**
 * Server actions тренажёров: фиксируют прогресс студента в
 * trainer_verb_progress. Экшены тихо выходят без сессии и не роняют
 * тренажёр из-за битых id (например, глагол удалили из-под открытой
 * сессии) — прогресс некритичен для работы интерфейса.
 */

/** Карточка показана студенту: заводим/обновляем запись, считаем показы. */
export async function recordCardView(trainerId: string, verbId: string) {
  const session = await getSession();
  if (!session) return;

  const now = new Date();
  try {
    await prisma.trainerVerbProgress.upsert({
      where: {
        userId_verbId_trainerId: { userId: session.user.id, verbId, trainerId },
      },
      create: {
        userId: session.user.id,
        verbId,
        trainerId,
        count: 1,
        lastViewAt: now,
      },
      update: {
        count: { increment: 1 },
        lastViewAt: now,
      },
    });
  } catch (error) {
    console.error("recordCardView failed:", error);
  }
}

/**
 * Студент оценил карточку: «Знаю» → learned, «Повторить» → repeat.
 * choice — что выбрал студент в «Выбери форму». Неверный ответ уходит
 * в журнал ошибок: по нему админка показывает, когда и в чём студент ошибается.
 */
export async function answerCard(
  trainerId: string,
  verbId: string,
  answer: "know" | "repeat",
  choice?: { sentenceId: string; chosen: string },
) {
  const session = await getSession();
  if (!session) return;
  if (answer !== "know" && answer !== "repeat") return;

  // Журнал пишется параллельно с прогрессом: лишний последовательный поход
  // в базу на каждой ошибке студенту ни к чему. logMistake не бросает.
  const logging =
    answer === "repeat" ? logMistake(session.user.id, trainerId, verbId, choice) : null;

  try {
    if (answer === "know") {
      // Один запрос вместо «прочитать + upsert»: learned_at должен заполниться
      // только при первом выучивании, это выражается лишь через COALESCE.
      await prisma.$executeRaw`
        INSERT INTO trainer_verb_progress
          (id, user_id, verb_id, trainer_id, status, count_know, learned_at, last_view_at, updated_at)
        VALUES
          (${randomUUID()}, ${session.user.id}, ${verbId}, ${trainerId}, 'learned', 1, now(), now(), now())
        ON CONFLICT (user_id, verb_id, trainer_id) DO UPDATE SET
          status = 'learned',
          count_know = trainer_verb_progress.count_know + 1,
          learned_at = COALESCE(trainer_verb_progress.learned_at, now()),
          updated_at = now()
      `;
      return;
    }

    await prisma.trainerVerbProgress.upsert({
      where: {
        userId_verbId_trainerId: { userId: session.user.id, verbId, trainerId },
      },
      create: {
        userId: session.user.id,
        verbId,
        trainerId,
        status: "repeat",
        countRepeat: 1,
        lastViewAt: new Date(),
      },
      update: {
        status: "repeat",
        countRepeat: { increment: 1 },
      },
    });
  } catch (error) {
    console.error("answerCard failed:", error);
  }

  await logging;
}

/** Повтор той же ошибки чаще этого — двойной тап или скрипт, в журнал не пишем. */
const MISTAKE_DEDUP_MS = 5_000;

/**
 * Строка в журнал ошибок. Отдельный try: сбой журнала не должен помешать
 * записи прогресса, ради которой экшен и вызван.
 *
 * sentenceId и chosen приходят с клиента, поэтому сверяем их с базой:
 * предложение должно принадлежать этому глаголу, а chosen — быть одним из
 * его неверных вариантов. Не сошлось — пишем ошибку без них, а не мусор,
 * который потом покажется админу как «типичная ошибка».
 */
async function logMistake(
  userId: string,
  trainerId: string,
  verbId: string,
  choice?: { sentenceId: string; chosen: string },
) {
  try {
    let sentenceId: string | null = null;
    let chosen: string | null = null;

    if (choice && typeof choice.sentenceId === "string") {
      const sentence = await prisma.verbSentence.findFirst({
        where: { id: choice.sentenceId, verbId },
        select: { id: true, options: true },
      });
      if (sentence) {
        sentenceId = sentence.id;
        const wrong = Object.values((sentence.options ?? {}) as Record<string, unknown>)
          .flatMap((variants) => (Array.isArray(variants) ? variants : []))
          .filter((option): option is SentenceOption => isWrongOption(option))
          .map((option) => option.text);
        if (typeof choice.chosen === "string" && wrong.includes(choice.chosen)) {
          chosen = choice.chosen;
        }
      }
    }

    const duplicate = await prisma.trainerMistake.findFirst({
      where: {
        userId,
        trainerId,
        verbId,
        sentenceId,
        chosen,
        createdAt: { gte: new Date(Date.now() - MISTAKE_DEDUP_MS) },
      },
      select: { id: true },
    });
    if (duplicate) return;

    await prisma.trainerMistake.create({
      data: { userId, trainerId, verbId, sentenceId, chosen },
    });
  } catch (error) {
    console.error("logMistake failed:", error);
  }
}

function isWrongOption(value: unknown): value is SentenceOption {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SentenceOption).text === "string" &&
    (value as SentenceOption).correct === false
  );
}
