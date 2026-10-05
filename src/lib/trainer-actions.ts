"use server";

import { randomUUID } from "node:crypto";

import { syncAchievements } from "@/dal/achievements";
import { prisma } from "@/lib/prisma";
import type { SentenceOption } from "@/lib/sentence-options";
import { fillSentence, isPermutation, sameOrder, tokenize } from "@/lib/word-order";
import {
  hasAnswer,
  isFormNumber,
  matchesForm,
  normalizeAnswer,
  type FormNumber,
} from "@/lib/verb-forms";
import { getSession } from "@/lib/session";
import { dayIn } from "@/lib/time-zone";
import { getTimeZone } from "@/lib/time-zone-server";

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
 * Что ответил студент — для журнала ошибок:
 * - «Выбери форму» и «Расставь слова»: предложение и ответ;
 * - «Заполни пропуски»: какую форму спрашивали и что студент вписал;
 * - «Подбери глагол к картинке» и «Выбери, что слышишь»: какой глагол
 *   студент выбрал вместо верного.
 */
export type AnswerChoice =
  | { sentenceId: string; chosen: string }
  | { form: FormNumber; chosen: string }
  | { pickedVerbId: string };

/**
 * Студент оценил карточку: «Знаю» → learned, «Повторить» → repeat.
 * Неверный ответ уходит в журнал ошибок: по нему админка показывает,
 * когда и в чём студент ошибается.
 */
export async function answerCard(
  trainerId: string,
  verbId: string,
  answer: "know" | "repeat",
  choice?: AnswerChoice,
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
    } else {
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
    }
    // Активность — только после успешной записи прогресса: вызов с битым
    // id глагола (экшен — публичный эндпоинт) не должен накручивать серию.
    await recordActivity(session.user.id, answer === "know");
    await recordRun(session.user.id, answer === "know");
    await recordAchievements(session.user.id);
  } catch (error) {
    console.error("answerCard failed:", error);
  }

  await logging;
}

/**
 * Ответ засчитывается в активность дня — по календарю студента. Из этих
 * строк дашборд считает серию дней. Отдельный try: сбой статистики не
 * должен помешать записи прогресса.
 */
async function recordActivity(userId: string, correct: boolean) {
  try {
    const day = dayIn(await getTimeZone());
    await prisma.$executeRaw`
      INSERT INTO user_activity_days (user_id, day, answers, correct)
      VALUES (${userId}, ${day}::date, 1, ${correct ? 1 : 0})
      ON CONFLICT (user_id, day) DO UPDATE SET
        answers = user_activity_days.answers + 1,
        correct = user_activity_days.correct + EXCLUDED.correct
    `;
  } catch (error) {
    console.error("recordActivity failed:", error);
  }
}

/**
 * Серия верных ответов подряд: «знаю» продлевает её, ошибка обнуляет.
 * Лучшая серия только растёт — по ней выдаются награды «без ошибок».
 */
async function recordRun(userId: string, correct: boolean) {
  try {
    if (correct) {
      await prisma.$executeRaw`
        INSERT INTO user_answer_runs (user_id, current, best)
        VALUES (${userId}, 1, 1)
        ON CONFLICT (user_id) DO UPDATE SET
          current = user_answer_runs.current + 1,
          best = GREATEST(user_answer_runs.best, user_answer_runs.current + 1)
      `;
    } else {
      await prisma.userAnswerRun.upsert({
        where: { userId },
        create: { userId, current: 0 },
        update: { current: 0 },
      });
    }
  } catch (error) {
    console.error("recordRun failed:", error);
  }
}

/** Выдаёт награды, заслуженные этим ответом. Сбой наград не мешает прогрессу. */
async function recordAchievements(userId: string) {
  try {
    await syncAchievements(userId, await getTimeZone());
  } catch (error) {
    console.error("recordAchievements failed:", error);
  }
}

/** Повтор той же ошибки чаще этого — двойной тап или скрипт, в журнал не пишем. */
const MISTAKE_DEDUP_MS = 5_000;

/** Вписанный ответ храним не длиннее этого: это слово, а не сочинение. */
const MAX_TYPED_LENGTH = 60;
/** Собранное предложение — длиннее слова, но тоже не сочинение. */
const MAX_ORDER_LENGTH = 300;

/**
 * Строка в журнал ошибок. Отдельный try: сбой журнала не должен помешать
 * записи прогресса, ради которой экшен и вызван.
 *
 * Ответ приходит с клиента, поэтому сверяем его с базой:
 * - предложение должно принадлежать этому глаголу, а chosen — быть одним
 *   из его неверных вариантов;
 * - вписанная форма должна действительно не совпадать с формой глагола.
 * Не сошлось — пишем ошибку без подробностей, а не мусор, который потом
 * покажется админу как «типичная ошибка».
 */
async function logMistake(
  userId: string,
  trainerId: string,
  verbId: string,
  choice?: AnswerChoice,
) {
  try {
    let sentenceId: string | null = null;
    let chosen: string | null = null;
    let form: FormNumber | null = null;

    // Экшен — публичный эндпоинт: choice может прийти чем угодно, а не только
    // объектом из нашего компонента. `in` на строке бросил бы TypeError, и
    // вместе с подробностями пропала бы сама ошибка.
    const details = typeof choice === "object" && choice !== null ? choice : null;
    // Форма ответа должна соответствовать тренажёру: вписанная форма —
    // только у «Заполни пропуски», предложение — только у «Выбери форму».
    const trainerKey = details
      ? (await prisma.trainer.findUnique({ where: { id: trainerId }, select: { key: true } }))?.key
      : null;

    if (trainerKey === "fill-blanks" && details && "form" in details && isFormNumber(details.form)) {
      const askedForm = details.form;
      const verb = await prisma.verb.findUnique({
        where: { id: verbId },
        select: { form1: true, form2: true, form3: true },
      });
      const typed = typeof details.chosen === "string" ? normalizeAnswer(details.chosen) : "";
      // Пустой ответ («/», пробелы) ошибкой в написании не считаем; верный —
      // тем более: клиент не должен суметь записать студенту чужую ошибку.
      if (verb && hasAnswer(typed) && !matchesForm(typed, verb, askedForm)) {
        form = askedForm;
        chosen = typed.slice(0, MAX_TYPED_LENGTH);
      }
    } else if (
      trainerKey === "multiple-choice" &&
      details &&
      "sentenceId" in details &&
      typeof details.sentenceId === "string"
    ) {
      const sentence = await prisma.verbSentence.findFirst({
        where: { id: details.sentenceId, verbId },
        select: { id: true, options: true },
      });
      if (sentence) {
        sentenceId = sentence.id;
        const wrong = Object.values((sentence.options ?? {}) as Record<string, unknown>)
          .flatMap((variants) => (Array.isArray(variants) ? variants : []))
          .filter((option): option is SentenceOption => isWrongOption(option))
          .map((option) => option.text);
        if (typeof details.chosen === "string" && wrong.includes(details.chosen)) {
          chosen = details.chosen;
        }
      }
    } else if (
      (trainerKey === "picture-match" || trainerKey === "listening") &&
      details &&
      "pickedVerbId" in details &&
      typeof details.pickedVerbId === "string" &&
      details.pickedVerbId !== verbId
    ) {
      // Пишем тройку форм выбранного глагола, а не id: так её видно в
      // админке и после удаления этого глагола.
      const picked = await prisma.verb.findUnique({
        where: { id: details.pickedVerbId },
        select: { form1: true, form2: true, form3: true },
      });
      if (picked) chosen = `${picked.form1} – ${picked.form2} – ${picked.form3}`;
    } else if (
      trainerKey === "word-order" &&
      details &&
      "sentenceId" in details &&
      typeof details.sentenceId === "string"
    ) {
      const sentence = await prisma.verbSentence.findFirst({
        where: { id: details.sentenceId, verbId },
        select: { id: true, text: true, options: true },
      });
      const full = sentence ? fillSentence(sentence.text, sentence.options) : null;
      if (sentence && full) {
        sentenceId = sentence.id;
        // Порядок студента храним, только если это те же слова и порядок
        // действительно неверный, — иначе в «типичные ошибки» попал бы мусор.
        const words = tokenize(full);
        const answer = typeof details.chosen === "string" ? tokenize(details.chosen) : [];
        if (isPermutation(answer, words) && !sameOrder(answer, words)) {
          chosen = answer.join(" ").slice(0, MAX_ORDER_LENGTH);
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
        form,
        createdAt: { gte: new Date(Date.now() - MISTAKE_DEDUP_MS) },
      },
      select: { id: true },
    });
    if (duplicate) return;

    await prisma.trainerMistake.create({
      data: { userId, trainerId, verbId, sentenceId, chosen, form },
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
