import "server-only";

import type { Prisma } from "../../generated/prisma/client";

import type { SentenceStatusValue } from "@/lib/admin-form";
import { prisma } from "@/lib/prisma";

/**
 * Выборки админки. Проверку роли делают страницы (requireAdmin) — этот слой
 * про данные, а не про доступ.
 */

export async function getAdminStats() {
  const [verbs, groups, sentences, drafts, users, admins] = await Promise.all([
    prisma.verb.count(),
    prisma.verbGroup.count(),
    prisma.verbSentence.count(),
    prisma.verbSentence.count({ where: { status: "draft" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
  ]);
  return { verbs, groups, sentences, drafts, users, admins };
}

// ── Глаголы ─────────────────────────────────────────────────────────────────

export async function listVerbs(query: string) {
  const q = query.trim();
  const where: Prisma.VerbWhereInput = q
    ? {
        OR: [
          { form1: { contains: q, mode: "insensitive" } },
          { form2: { contains: q, mode: "insensitive" } },
          { form3: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  return prisma.verb.findMany({
    where,
    orderBy: [{ form1: "asc" }, { form2: "asc" }],
    include: {
      groups: { include: { group: { select: { key: true } } } },
      _count: { select: { sentences: true } },
    },
  });
}

export async function getVerb(id: string) {
  return prisma.verb.findUnique({
    where: { id },
    include: {
      groups: { select: { verbGroupId: true } },
      sentences: { orderBy: { createdAt: "asc" }, select: { id: true, text: true, status: true } },
    },
  });
}

/** Короткий список глаголов для выпадающих списков. */
export async function listVerbOptions() {
  return prisma.verb.findMany({
    orderBy: [{ form1: "asc" }, { form2: "asc" }],
    select: { id: true, form1: true, form2: true, form3: true },
  });
}

// ── Группы ──────────────────────────────────────────────────────────────────

export async function listGroups() {
  // createdAt повторяет порядок сида — тот же, что видят студенты на /verbs.
  return prisma.verbGroup.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { verbs: true } } },
  });
}

export async function getGroup(id: string) {
  return prisma.verbGroup.findUnique({
    where: { id },
    include: {
      verbs: {
        include: { verb: { select: { id: true, form1: true, form2: true, form3: true } } },
      },
    },
  });
}

// ── Предложения ─────────────────────────────────────────────────────────────

export async function listSentences(filter: {
  query: string;
  status: SentenceStatusValue | null;
  verbId: string | null;
}) {
  const q = filter.query.trim();
  return prisma.verbSentence.findMany({
    where: {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.verbId ? { verbId: filter.verbId } : {}),
      ...(q ? { text: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    include: { verb: { select: { form1: true, form2: true, form3: true } } },
  });
}

export async function getSentence(id: string) {
  return prisma.verbSentence.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      updatedBy: { select: { name: true, email: true } },
    },
  });
}

// ── Пользователи ────────────────────────────────────────────────────────────

/** Пользователей может быть много — отдаём последние 100 зарегистрированных. */
export const USERS_LIMIT = 100;

export async function listUsers(query: string) {
  const q = query.trim();
  return prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: USERS_LIMIT,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

// ── Тренажёры ───────────────────────────────────────────────────────────────

export async function listTrainers() {
  return prisma.trainer.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, key: true, name: true, description: true },
  });
}

export async function getTrainerByKey(key: string) {
  return prisma.trainer.findUnique({ where: { key } });
}

/**
 * Сколько материала у тренажёров: глаголы и группы читает «Карточки»,
 * предложения — «Выбери форму». Счётчик опубликованных не учитывает
 * фильтр «ровно один пропуск» — его применяет страница тренажёра.
 */
export async function getTrainerContentStats() {
  const [verbs, groups, published, drafts, archived, studentsByTrainer] = await Promise.all([
    prisma.verb.count(),
    prisma.verbGroup.count(),
    prisma.verbSentence.count({ where: { status: "published" } }),
    prisma.verbSentence.count({ where: { status: "draft" } }),
    prisma.verbSentence.count({ where: { status: "archived" } }),
    prisma.trainerVerbProgress.groupBy({ by: ["trainerId", "userId"] }),
  ]);

  const students = new Map<string, number>();
  for (const row of studentsByTrainer) {
    students.set(row.trainerId, (students.get(row.trainerId) ?? 0) + 1);
  }

  return { verbs, groups, published, drafts, archived, students };
}

// ── Статистика пользователей ────────────────────────────────────────────────
//
// Источники: trainer_verb_progress — итог по каждому глаголу (сколько раз
// «знаю» и «повторить», когда выучен), trainer_mistakes — журнал неверных
// ответов с датой и выбранным вариантом. Верные ответы по отдельности не
// хранятся, поэтому дневная активность считается по ошибкам и выучиванию.

/** Окно графиков и сводок активности. */
export const STATS_DAYS = 30;

/**
 * Часовой пояс, по которому события раскладываются по дням. Без него день
 * считался бы в UTC, и вечерние занятия уезжали бы на завтра.
 */
export const STATS_TIME_ZONE = "Europe/Bratislava";

/**
 * Начало окна статистики: полночь (в STATS_TIME_ZONE) первого из STATS_DAYS
 * календарных дней, включая сегодня. Считает Postgres: он знает правила
 * перевода часов, а «минус 30 × 24 часа» около перевода съезжает на день.
 * Одна граница на все выборки — список пользователей и страница
 * пользователя показывают одинаковые числа.
 */
async function statsSince() {
  const [row] = await prisma.$queryRaw<{ since: Date }[]>`
    SELECT (date_trunc('day', now() AT TIME ZONE ${STATS_TIME_ZONE})
            - make_interval(days => ${STATS_DAYS - 1}))
           AT TIME ZONE ${STATS_TIME_ZONE} AS since
  `;
  return row.since;
}

export type UserActivity = {
  /** Ответов «знаю» и «повторить» за всё время. */
  know: number;
  repeat: number;
  learned: number;
  mistakes30: number;
  lastActiveAt: Date | null;
};

/** Сводка для таблицы пользователей. */
export async function getUsersActivity(userIds: string[]) {
  const result = new Map<string, UserActivity>();
  if (userIds.length === 0) return result;

  const since = await statsSince();
  const [progress, learned, mistakes] = await Promise.all([
    prisma.trainerVerbProgress.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _sum: { countKnow: true, countRepeat: true },
      _max: { lastViewAt: true },
    }),
    prisma.trainerVerbProgress.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, status: "learned" },
      _count: { _all: true },
    }),
    prisma.trainerMistake.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  for (const id of userIds) {
    result.set(id, { know: 0, repeat: 0, learned: 0, mistakes30: 0, lastActiveAt: null });
  }
  for (const row of progress) {
    const item = result.get(row.userId)!;
    item.know = row._sum.countKnow ?? 0;
    item.repeat = row._sum.countRepeat ?? 0;
    item.lastActiveAt = row._max.lastViewAt;
  }
  for (const row of learned) result.get(row.userId)!.learned = row._count._all;
  for (const row of mistakes) result.get(row.userId)!.mistakes30 = row._count._all;
  return result;
}

export type DailyCount = { day: string; count: number };

/** Всё для страницы пользователя. null — пользователя нет. */
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) return null;

  const since = await statsSince();

  const [
    mistakesDaily,
    learnedDaily,
    progress,
    trainers,
    mistakes,
    recent,
    problemVerbs,
    typedMistakes,
  ] = await Promise.all([
      prisma.$queryRaw<DailyCount[]>`
        SELECT to_char(created_at AT TIME ZONE ${STATS_TIME_ZONE}, 'YYYY-MM-DD') AS day,
               count(*)::int AS count
        FROM trainer_mistakes
        WHERE user_id = ${userId} AND created_at >= ${since}
        GROUP BY 1
      `,
      // learned_at ставится при первом выучивании — это и есть «новые выученные за день».
      prisma.$queryRaw<DailyCount[]>`
        SELECT to_char(learned_at AT TIME ZONE ${STATS_TIME_ZONE}, 'YYYY-MM-DD') AS day,
               count(*)::int AS count
        FROM trainer_verb_progress
        WHERE user_id = ${userId} AND learned_at >= ${since}
        GROUP BY 1
      `,
      prisma.trainerVerbProgress.groupBy({
        by: ["trainerId", "status"],
        where: { userId },
        _count: { _all: true },
        _sum: { countKnow: true, countRepeat: true },
        _max: { lastViewAt: true },
      }),
      prisma.trainer.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, key: true, name: true },
      }),
      // Типичные ошибки: какое предложение и какой неверный вариант выбирался чаще всего.
      prisma.trainerMistake.groupBy({
        by: ["sentenceId", "chosen"],
        where: { userId, sentenceId: { not: null } },
        _count: { _all: true },
        _max: { createdAt: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.trainerMistake.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          chosen: true,
          form: true,
          createdAt: true,
          trainer: { select: { key: true, name: true } },
          verb: { select: { id: true, form1: true, form2: true, form3: true } },
          sentence: { select: { id: true, text: true, options: true } },
        },
      }),
      // Счётчики прогресса копятся с первого занятия — в отличие от журнала,
      // они есть и у тех, кто занимался до его появления.
      prisma.trainerVerbProgress.findMany({
        where: { userId, countRepeat: { gt: 0 } },
        orderBy: [{ countRepeat: "desc" }, { lastViewAt: "desc" }],
        take: 10,
        select: {
          id: true,
          status: true,
          countKnow: true,
          countRepeat: true,
          lastViewAt: true,
          trainer: { select: { key: true, name: true } },
          verb: { select: { id: true, form1: true, form2: true, form3: true } },
        },
      }),
      // «Заполни пропуски»: какую форму какого глагола и как студент писал неверно.
      prisma.trainerMistake.groupBy({
        by: ["verbId", "form", "chosen"],
        where: { userId, form: { not: null }, chosen: { not: null } },
        _count: { _all: true },
        _max: { createdAt: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

  const typedVerbIds = typedMistakes.map((row) => row.verbId);
  const typedVerbs = await prisma.verb.findMany({
    where: { id: { in: typedVerbIds } },
    select: { id: true, form1: true, form2: true, form3: true },
  });

  const sentenceIds = mistakes.flatMap((row) => (row.sentenceId ? [row.sentenceId] : []));
  const sentences = await prisma.verbSentence.findMany({
    where: { id: { in: sentenceIds } },
    select: { id: true, text: true, options: true, verb: { select: { form1: true } } },
  });

  return {
    user,
    mistakesDaily,
    learnedDaily,
    progress,
    trainers,
    mistakes,
    sentences,
    recent,
    problemVerbs,
    typedMistakes,
    typedVerbs,
  };
}
