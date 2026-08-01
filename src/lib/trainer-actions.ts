"use server";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
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

/** Студент оценил карточку: «Знаю» → learned, «Повторить» → repeat. */
export async function answerCard(
  trainerId: string,
  verbId: string,
  answer: "know" | "repeat",
) {
  const session = await getSession();
  if (!session) return;
  if (answer !== "know" && answer !== "repeat") return;

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
}
