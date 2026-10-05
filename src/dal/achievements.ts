import "server-only";

import { longestStreak, streakLength } from "@/dal/dashboard";
import {
  type Achievement,
  ACHIEVEMENTS,
  type AchievementMetrics,
  goalOf,
  isEarned,
} from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { dayIn } from "@/lib/time-zone";

/**
 * Награды студента. Показатели считаются из уже накопленных данных
 * (user_activity_days, trainer_verb_progress, user_answer_runs), поэтому
 * при первом подсчёте студент сразу получает всё, что заслужил раньше.
 */

async function loadMetrics(userId: string, timeZone: string) {
  const [days, learnedRows, totalVerbs, run] = await Promise.all([
    prisma.$queryRaw<{ day: string }[]>`
      SELECT to_char(day, 'YYYY-MM-DD') AS day
      FROM user_activity_days
      WHERE user_id = ${userId} AND answers > 0
      ORDER BY day
    `,
    // Глагол выучен, если выучен хотя бы в одном тренажёре — как на дашборде.
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT verb_id)::int AS count
      FROM trainer_verb_progress
      WHERE user_id = ${userId} AND status = 'learned'
    `,
    prisma.verb.count(),
    prisma.userAnswerRun.findUnique({ where: { userId }, select: { current: true, best: true } }),
  ]);

  const dayList = days.map((row) => row.day);
  const metrics: AchievementMetrics = {
    bestStreak: longestStreak(dayList),
    bestRun: run?.best ?? 0,
    learned: learnedRows[0]?.count ?? 0,
    totalVerbs,
  };
  return {
    metrics,
    // Текущие значения — для прогресса к ещё не полученным наградам: серию
    // дней и ответов надо набирать заново, лучшая прошлая не в счёт.
    current: {
      streak: streakLength(new Set(dayList), dayIn(timeZone)),
      run: run?.current ?? 0,
    },
  };
}

/** Выдаёт заслуженные, но ещё не записанные награды. Повторный вызов безопасен. */
async function grant(userId: string, metrics: AchievementMetrics) {
  const earned = ACHIEVEMENTS.filter((achievement) => isEarned(achievement, metrics));
  if (earned.length === 0) return;
  await prisma.userAchievement.createMany({
    data: earned.map((achievement) => ({ userId, key: achievement.key })),
    skipDuplicates: true,
  });
}

/** Пересчёт после ответа в тренажёре. */
export async function syncAchievements(userId: string, timeZone: string) {
  const { metrics } = await loadMetrics(userId, timeZone);
  await grant(userId, metrics);
}

export type AchievementView = Achievement & {
  /** Когда получена; null — ещё нет. */
  earnedAt: Date | null;
  /** Сколько набрано к порогу сейчас. */
  value: number;
  goal: number;
};

/** Все награды для страницы прогресса: полученные с датой, остальные с прогрессом. */
export async function getAchievements(userId: string, timeZone: string) {
  const { metrics, current } = await loadMetrics(userId, timeZone);
  // Заодно выдаём награды за прошлые заслуги — до первого ответа после
  // появления наград их бы иначе никто не записал.
  await grant(userId, metrics);
  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    select: { key: true, earnedAt: true },
  });
  const earnedAt = new Map(rows.map((row) => [row.key, row.earnedAt]));

  const achievements: AchievementView[] = ACHIEVEMENTS.flatMap((achievement) => {
    const goal = goalOf(achievement, metrics.totalVerbs);
    const earned = earnedAt.get(achievement.key) ?? null;
    // Порог не меньше всего справочника — его покрывает «выучить все»;
    // такую ступень не показываем, если она не была получена раньше.
    if (achievement.kind === "learned" && achievement.goal !== "all" && goal >= metrics.totalVerbs && !earned) {
      return [];
    }
    const value =
      achievement.kind === "streak"
        ? current.streak
        : achievement.kind === "run"
          ? current.run
          : metrics.learned;
    return [{ ...achievement, earnedAt: earned, value: Math.min(value, goal), goal }];
  });

  return {
    achievements,
    earned: achievements.filter((achievement) => achievement.earnedAt).length,
    current,
    learned: metrics.learned,
  };
}

export type AchievementsPage = Awaited<ReturnType<typeof getAchievements>>;
