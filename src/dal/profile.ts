import "server-only";

import { deckSize, getDashboardStats, longestStreak } from "@/dal/dashboard";
import { accuracy } from "@/lib/admin-stats";
import { prisma } from "@/lib/prisma";
import { dayIn, shiftDay } from "@/lib/time-zone";

/**
 * Статистика страницы профиля: всё, что дашборд, плюс подробности.
 * - trainer_verb_progress — судьба каждого глагола в каждом тренажёре,
 *   счётчики верных и неверных ответов за всю историю;
 * - user_activity_days — ответы по дням (график, лучшая серия);
 * - trainer_mistakes — журнал ошибок (трудные глаголы).
 */

/** Сколько дней показывает график активности. */
export const ACTIVITY_DAYS = 28;
/** Сколько трудных глаголов показывать. */
const HARD_VERBS = 8;

export type ProfileVerb = {
  id: string;
  form1: string;
  form2: string;
  form3: string;
  translation: unknown;
  /** Доля верных ответов по глаголу во всех тренажёрах; null — ответов не было. */
  accuracy: number | null;
};

export async function getProfileStats(userId: string, timeZone: string) {
  const today = dayIn(timeZone);

  const [dashboard, user, activity, progress, trainers, verbs, mistakesByVerb] =
    await Promise.all([
      getDashboardStats(userId, timeZone),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true, createdAt: true },
      }),
      prisma.$queryRaw<{ day: string; answers: number; correct: number }[]>`
        SELECT to_char(day, 'YYYY-MM-DD') AS day, answers, correct
        FROM user_activity_days
        WHERE user_id = ${userId} AND answers > 0
        ORDER BY day
      `,
      prisma.trainerVerbProgress.findMany({
        where: { userId },
        select: {
          verbId: true,
          trainerId: true,
          status: true,
          countKnow: true,
          countRepeat: true,
          learnedAt: true,
          lastViewAt: true,
        },
      }),
      prisma.trainer.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, key: true, name: true },
      }),
      prisma.verb.findMany({
        select: { id: true, form1: true, form2: true, form3: true, translation: true },
      }),
      prisma.trainerMistake.groupBy({
        by: ["verbId"],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

  // ── Глаголы: сводим строки «глагол × тренажёр» в одну на глагол ──────────
  type VerbSummary = {
    learned: boolean;
    /** Когда глагол впервые выучен хоть в одном тренажёре. */
    learnedAt: Date | null;
    lastViewAt: Date | null;
    know: number;
    repeat: number;
  };
  const byVerb = new Map<string, VerbSummary>();
  for (const row of progress) {
    const summary = byVerb.get(row.verbId) ?? {
      learned: false,
      learnedAt: null,
      lastViewAt: null,
      know: 0,
      repeat: 0,
    };
    summary.know += row.countKnow;
    summary.repeat += row.countRepeat;
    if (row.status === "learned") {
      summary.learned = true;
      if (row.learnedAt && (!summary.learnedAt || row.learnedAt < summary.learnedAt)) {
        summary.learnedAt = row.learnedAt;
      }
    }
    if (row.lastViewAt && (!summary.lastViewAt || row.lastViewAt > summary.lastViewAt)) {
      summary.lastViewAt = row.lastViewAt;
    }
    byVerb.set(row.verbId, summary);
  }

  const verbById = new Map(verbs.map((verb) => [verb.id, verb]));
  const toProfileVerb = (id: string): ProfileVerb | null => {
    const verb = verbById.get(id);
    if (!verb) return null;
    const summary = byVerb.get(id);
    return { ...verb, accuracy: summary ? accuracy(summary.know, summary.repeat) : null };
  };
  const time = (date: Date | null) => date?.getTime() ?? 0;

  const summaries = [...byVerb.entries()];
  // Выученные — свежие сверху; изучаемые — те, что видел недавно.
  const learnedVerbs = summaries
    .filter(([, s]) => s.learned)
    .sort(([, a], [, b]) => time(b.learnedAt) - time(a.learnedAt))
    .flatMap(([id]) => toProfileVerb(id) ?? []);
  // «Изучает» — был хотя бы один ответ, но ни в одном тренажёре не выучен.
  // Просто показанная карточка без ответа ещё не начало.
  const learningVerbs = summaries
    .filter(([, s]) => !s.learned && s.know + s.repeat > 0)
    .sort(([, a], [, b]) => time(b.lastViewAt) - time(a.lastViewAt))
    .flatMap(([id]) => toProfileVerb(id) ?? []);

  // Трудные — по числу «не знаю» и ошибок вместе: счётчики есть за всю
  // историю, журнал ошибок — подробнее, но появился позже.
  const mistakes = new Map(mistakesByVerb.map((row) => [row.verbId, row._count._all]));
  const hardVerbs = verbs
    .map((verb) => ({
      id: verb.id,
      score: (byVerb.get(verb.id)?.repeat ?? 0) + (mistakes.get(verb.id) ?? 0),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, HARD_VERBS)
    .flatMap(({ id, score }) => {
      const verb = toProfileVerb(id);
      return verb ? [{ ...verb, misses: score }] : [];
    });

  // ── Ответы ────────────────────────────────────────────────────────────────
  const know = progress.reduce((sum, row) => sum + row.countKnow, 0);
  const repeat = progress.reduce((sum, row) => sum + row.countRepeat, 0);

  // ── Тренажёры ─────────────────────────────────────────────────────────────
  const byTrainer = await Promise.all(
    trainers.map(async (trainer) => {
      const rows = progress.filter((row) => row.trainerId === trainer.id);
      const trainerKnow = rows.reduce((sum, row) => sum + row.countKnow, 0);
      const trainerRepeat = rows.reduce((sum, row) => sum + row.countRepeat, 0);
      return {
        ...trainer,
        learned: rows.filter((row) => row.status === "learned").length,
        total: await deckSize(trainer.key),
        answers: trainerKnow + trainerRepeat,
        accuracy: accuracy(trainerKnow, trainerRepeat),
      };
    }),
  );

  // ── Активность по дням ────────────────────────────────────────────────────
  const activeDays = new Set(activity.map((row) => row.day));
  const answersByDay = new Map(activity.map((row) => [row.day, row.answers]));
  const days = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
    const day = shiftDay(today, i - ACTIVITY_DAYS + 1);
    return { day, answers: answersByDay.get(day) ?? 0 };
  });
  const weekAgo = shiftDay(today, -6);
  const answersThisWeek = activity
    .filter((row) => row.day >= weekAgo)
    .reduce((sum, row) => sum + row.answers, 0);
  const learnedThisWeek = learnedVerbs.filter((verb) => {
    const learnedAt = byVerb.get(verb.id)?.learnedAt;
    return learnedAt && dayIn(timeZone, learnedAt) >= weekAgo;
  }).length;

  return {
    user,
    level: dashboard.level,
    streak: dashboard.streak,
    // Текущая серия может быть длиннее записанной истории, если журнал дней
    // моложе самой серии, — лучшая не меньше текущей.
    bestStreak: Math.max(longestStreak(activity.map((row) => row.day)), dashboard.streak),
    week: dashboard.week,
    totalVerbs: dashboard.totalVerbs,
    verbs: {
      learned: learnedVerbs,
      learning: learningVerbs,
      notStarted: Math.max(0, dashboard.totalVerbs - learnedVerbs.length - learningVerbs.length),
      hard: hardVerbs,
    },
    answers: { total: know + repeat, accuracy: accuracy(know, repeat) },
    activity: {
      days,
      activeDays: activeDays.size,
      answersThisWeek,
      learnedThisWeek,
      /** Средне ответов за день занятий. */
      perActiveDay:
        activeDays.size > 0
          ? Math.round(activity.reduce((sum, row) => sum + row.answers, 0) / activeDays.size)
          : 0,
    },
    trainers: byTrainer,
  };
}

export type ProfileStats = Awaited<ReturnType<typeof getProfileStats>>;
