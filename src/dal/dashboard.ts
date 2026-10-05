import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { dayIn, shiftDay } from "@/lib/time-zone";

/**
 * Статистика дашборда студента. Всё считается из реальных данных:
 * - trainer_verb_progress — что выучено и где студент занимался последним;
 * - user_activity_days — ответы по дням (серия, цель дня, неделя).
 */

/** Цель дня в ответах, пока у студента нет своей настройки. */
export const DAILY_GOAL = 20;

/** Уровни по доле выученных глаголов: порог — минимальная доля для уровня. */
const LEVELS = [
  { level: "C1", share: 0.8 },
  { level: "B2", share: 0.55 },
  { level: "B1", share: 0.3 },
  { level: "A2", share: 0.1 },
  { level: "A1", share: 0 },
] as const;

export type Level = (typeof LEVELS)[number]["level"];

export type WeekDay = {
  /** YYYY-MM-DD в поясе студента. */
  day: string;
  state: "done" | "today" | "missed" | "future";
};

/** Сколько дней истории читать для серии: длиннее серии на практике не бывает. */
const STREAK_LOOKBACK_DAYS = 400;

/** Тренажёры, чья колода — глаголы с опубликованными предложениями, а не все глаголы. */
const SENTENCE_TRAINERS = new Set(["multiple-choice", "word-order"]);

export async function getDashboardStats(userId: string, timeZone: string) {
  const today = dayIn(timeZone);
  const since = shiftDay(today, -STREAK_LOOKBACK_DAYS);

  const [totalVerbs, learnedRows, answersAgg, activity, lastProgress] = await Promise.all([
    prisma.verb.count(),
    // Глагол выучен, если выучен хотя бы в одном тренажёре.
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT verb_id)::int AS count
      FROM trainer_verb_progress
      WHERE user_id = ${userId} AND status = 'learned'
    `,
    prisma.trainerVerbProgress.aggregate({
      where: { userId },
      _sum: { countKnow: true, countRepeat: true },
    }),
    prisma.$queryRaw<{ day: string; answers: number }[]>`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, answers
      FROM user_activity_days
      WHERE user_id = ${userId} AND day >= ${since}::date AND answers > 0
    `,
    // Последний тренажёр — тот, где менялся прогресс (показ или ответ).
    prisma.trainerVerbProgress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { trainer: { select: { id: true, key: true, name: true } } },
    }),
  ]);

  const learned = learnedRows[0]?.count ?? 0;
  const answers = (answersAgg._sum.countKnow ?? 0) + (answersAgg._sum.countRepeat ?? 0);
  const activeDays = new Set(activity.map((row) => row.day));
  const todayAnswers = activity.find((row) => row.day === today)?.answers ?? 0;

  return {
    totalVerbs,
    learned,
    answers,
    level: levelFor(learned, totalVerbs),
    streak: streakLength(activeDays, today),
    week: weekOf(activeDays, today),
    today: { done: todayAnswers, goal: DAILY_GOAL, active: activeDays.has(today) },
    continueWith: await continueWith(userId, lastProgress?.trainer ?? null),
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

function levelFor(learned: number, total: number): Level {
  const share = total > 0 ? learned / total : 0;
  return LEVELS.find((l) => share >= l.share)?.level ?? "A1";
}

/**
 * Серия — подряд идущие дни с ответами, считая назад от сегодня. Сегодня
 * ещё не занимался — серия не сгорает до конца дня: считаем от вчера.
 */
export function streakLength(activeDays: Set<string>, today: string) {
  let day = activeDays.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (activeDays.has(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return streak;
}

/** Самая длинная серия подряд идущих дней за всю историю; дни — по возрастанию. */
export function longestStreak(sortedDays: string[]) {
  let best = 0;
  let current = 0;
  let previous: string | null = null;
  for (const day of sortedDays) {
    current = previous && shiftDay(previous, 1) === day ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return best;
}

/** Текущая неделя с понедельника: занимался / сегодня / пропуск / впереди. */
function weekOf(activeDays: Set<string>, today: string): WeekDay[] {
  const [year, month, date] = today.split("-").map(Number);
  // getUTCDay: 0 — воскресенье; переводим к понедельнику = 0.
  const offset = (new Date(Date.UTC(year, month - 1, date)).getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const day = shiftDay(today, i - offset);
    const state: WeekDay["state"] = activeDays.has(day)
      ? "done"
      : i === offset
        ? "today"
        : i > offset
          ? "future"
          : "missed";
    return { day, state };
  });
}

/**
 * Куда ведёт «Продолжить обучение»: последний тренажёр студента, а новичку —
 * первый по порядку (started: false). null — тренажёров в базе нет вообще.
 */
async function continueWith(
  userId: string,
  last: { id: string; key: string; name: unknown } | null,
) {
  if (last) return { ...(await trainerProgress(userId, last)), started: true };

  const first = await prisma.trainer.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, key: true, name: true },
  });
  return first ? { ...(await trainerProgress(userId, first)), started: false } : null;
}

/** Сколько глаголов выучено в тренажёре из его колоды. */
async function trainerProgress(
  userId: string,
  trainer: { id: string; key: string; name: unknown },
) {
  const [learned, total] = await Promise.all([
    prisma.trainerVerbProgress.count({
      where: { userId, trainerId: trainer.id, status: "learned" },
    }),
    deckSize(trainer.key),
  ]);
  return { ...trainer, learned, total };
}

/**
 * Сколько глаголов в колоде тренажёра: не каждый глагол годится для каждого.
 * Колод всего три вида, а тренажёров больше — счёт кэшируется на запрос,
 * чтобы одинаковые подсчёты не уходили в БД по нескольку раз.
 */
export function deckSize(trainerKey: string) {
  return countDeck(
    SENTENCE_TRAINERS.has(trainerKey)
      ? "sentences"
      : trainerKey === "picture-match"
        ? "pictures"
        : "all",
  );
}

const countDeck = cache(async (deck: "sentences" | "pictures" | "all") =>
  deck === "sentences"
    ? prisma.verb.count({ where: { sentences: { some: { status: "published" } } } })
    : deck === "pictures"
      ? prisma.verb.count({ where: { imageUrl: { not: null } } })
      : prisma.verb.count(),
);
