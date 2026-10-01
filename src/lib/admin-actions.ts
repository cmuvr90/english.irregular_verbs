"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "../../generated/prisma/client";

import {
  hasDefaultLocale,
  isSentenceStatus,
  readLocalized,
  type ActionState,
} from "@/lib/admin-form";
import { defaultLocale, locales, type Locale } from "@/lib/locales";
import { prisma } from "@/lib/prisma";
import { isAdmin, roles, type Role } from "@/lib/roles";
import { validateSentence } from "@/lib/sentence-options";
import { getFreshSession } from "@/lib/session";
import type { TrainerSettings } from "@/lib/trainer-settings";

/**
 * Server actions админки. Каждый экшен сам проверяет роль: экшен — это
 * публичный POST-эндпоинт, и то, что форма нарисована только на админской
 * странице, его не защищает.
 *
 * Глаголы, группы и предложения видны студентам на страницах приложения,
 * поэтому после правки сбрасываем кеш всего дерева, а не одной страницы.
 */

async function assertAdmin() {
  const session = await getFreshSession();
  if (!session || !isAdmin(session.user)) throw new Error("Forbidden");
  return session;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

/**
 * Известные ошибки Prisma → сообщение в форме вместо страницы ошибки
 * (там пропало бы всё введённое):
 * - P2002 — нарушен уникальный индекс (дубль);
 * - P2003 — ссылка на удалённую запись (группу или глагол удалили в соседней вкладке);
 * - P2025 — сама запись удалена, пока форма была открыта.
 */
type KnownCode = "P2002" | "P2003" | "P2025";

function knownError(
  error: unknown,
  messages: Partial<Record<KnownCode, string>>,
): ActionState | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  const message = messages[error.code as KnownCode];
  return message ? { error: message } : null;
}

/** Удаление уже удалённого (P2025) — не ошибка: результат тот же. */
function isNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

const STALE_LINK = "Связанная запись удалена — обновите страницу и проверьте форму";

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

// ── Глаголы ─────────────────────────────────────────────────────────────────

export async function saveVerb(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const form1 = readString(formData, "form1");
  const form2 = readString(formData, "form2");
  const form3 = readString(formData, "form3");
  const translation = readLocalized(formData, "translation");
  // Set — на случай, если один id прилетит дважды: составной PK связи не простит дубль.
  const groupIds = [...new Set(formData.getAll("groups").map(String))];

  if (!form1 || !form2 || !form3) return { error: "Заполните все три формы глагола" };
  if (!hasDefaultLocale(translation)) return { error: "Нужен хотя бы английский перевод" };

  try {
    if (id) {
      // Состав групп задаёт форма целиком: проще пересобрать связи, чем считать дифф.
      await prisma.$transaction([
        prisma.verb.update({ where: { id }, data: { form1, form2, form3, translation } }),
        prisma.verbGroupLink.deleteMany({ where: { verbId: id } }),
        prisma.verbGroupLink.createMany({
          data: groupIds.map((verbGroupId) => ({ verbId: id, verbGroupId })),
        }),
      ]);
    } else {
      await prisma.verb.create({
        data: {
          form1,
          form2,
          form3,
          translation,
          groups: { create: groupIds.map((verbGroupId) => ({ verbGroupId })) },
        },
      });
    }
  } catch (error) {
    const known = knownError(error, {
      P2002: "Глагол с такими тремя формами уже есть",
      P2003: STALE_LINK,
      P2025: "Глагол удалён — его уже нельзя сохранить",
    });
    if (known) return known;
    throw error;
  }

  revalidateAll();
  redirect("/admin/verbs");
}

export async function deleteVerb(id: string) {
  await assertAdmin();
  // Каскадом уходят связи с группами, предложения и прогресс студентов.
  try {
    const verb = await prisma.verb.delete({ where: { id }, select: { imageUrl: true } });
    await deleteBlobQuietly(verb.imageUrl);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
  revalidateAll();
  redirect("/admin/verbs");
}

// ── Картинки глаголов (Vercel Blob) ─────────────────────────────────────────

/** Картинка — иллюстрация на карточке, не фото с телефона: 2 МБ с запасом. */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Форматы, которые показывают все браузеры; расширение — для имени файла. */
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Хранилище подключено? На Vercel ключ BLOB_READ_WRITE_TOKEN проставляет
 * интеграция Blob; локально его копируют в .env.local вручную из настроек
 * хранилища. Без проверки put() упал бы невнятной ошибкой SDK.
 */
function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/**
 * Удаляет файл из Blob, не роняя основное действие: запись в базе уже
 * обновлена, а осиротевший файл — копейки места, а не сломанная страница.
 * Чужие URL (не из Blob) не трогаем.
 */
async function deleteBlobQuietly(url: string | null) {
  if (!url || !blobConfigured()) return;
  try {
    if (!new URL(url).hostname.endsWith(".public.blob.vercel-storage.com")) return;
    await del(url);
  } catch (error) {
    console.error("deleteBlob failed:", error);
  }
}

export async function uploadVerbImage(
  verbId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  if (!blobConfigured()) {
    return {
      error:
        "Хранилище картинок не подключено: нет BLOB_READ_WRITE_TOKEN. " +
        "Подключите Vercel Blob в Storage и скопируйте токен из настроек хранилища в .env.local",
    };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Выберите файл картинки" };
  const extension = IMAGE_TYPES[file.type];
  if (!extension) return { error: "Подойдёт PNG, JPEG, WebP или AVIF" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Картинка больше 2 МБ — уменьшите её" };

  const verb = await prisma.verb.findUnique({
    where: { id: verbId },
    select: { form1: true, imageUrl: true },
  });
  if (!verb) return { error: "Глагол удалён — обновите страницу" };

  // Имя по инфинитиву — чтобы в хранилище было видно, чья картинка;
  // случайный суффикс — чтобы замена давала новый URL и не упиралась в кеш CDN.
  const slug = verb.form1.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "verb";
  let url: string;
  try {
    const blob = await put(`verbs/${slug}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    url = blob.url;
  } catch (error) {
    console.error("uploadVerbImage failed:", error);
    return { error: "Не удалось загрузить картинку в хранилище — попробуйте ещё раз" };
  }

  try {
    await prisma.verb.update({ where: { id: verbId }, data: { imageUrl: url } });
  } catch (error) {
    // Запись не обновилась — новый файл никому не нужен.
    await deleteBlobQuietly(url);
    const known = knownError(error, { P2025: "Глагол удалён — обновите страницу" });
    if (known) return known;
    throw error;
  }

  await deleteBlobQuietly(verb.imageUrl);
  revalidateAll();
  return { saved: true };
}

export async function removeVerbImage(verbId: string) {
  await assertAdmin();
  const verb = await prisma.verb.findUnique({ where: { id: verbId }, select: { imageUrl: true } });
  if (!verb?.imageUrl) return;
  await prisma.verb.update({ where: { id: verbId }, data: { imageUrl: null } });
  await deleteBlobQuietly(verb.imageUrl);
  revalidateAll();
}

// ── Группы ──────────────────────────────────────────────────────────────────

/** Машинный ключ попадает в адрес /verbs/<key> — только безопасные символы. */
const GROUP_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function saveGroup(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const key = readString(formData, "key");
  const name = readLocalized(formData, "name");
  const description = readLocalized(formData, "description");

  if (!GROUP_KEY_PATTERN.test(key)) {
    return { error: "Ключ: латиница в нижнем регистре, цифры и дефисы (например, most-common)" };
  }
  if (!hasDefaultLocale(name)) return { error: "Нужно хотя бы английское название" };

  try {
    if (id) {
      await prisma.verbGroup.update({ where: { id }, data: { key, name, description } });
    } else {
      await prisma.verbGroup.create({ data: { key, name, description } });
    }
  } catch (error) {
    const known = knownError(error, {
      P2002: `Группа с ключом "${key}" уже есть`,
      P2025: "Группа удалена — её уже нельзя сохранить",
    });
    if (known) return known;
    throw error;
  }

  revalidateAll();
  redirect("/admin/groups");
}

export async function deleteGroup(id: string) {
  await assertAdmin();
  // Глаголы остаются, удаляются только связи с группой.
  try {
    await prisma.verbGroup.delete({ where: { id } });
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
  revalidateAll();
  redirect("/admin/groups");
}

// ── Предложения ─────────────────────────────────────────────────────────────

export async function saveSentence(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertAdmin();

  const verbId = readString(formData, "verbId");
  const text = readString(formData, "text");
  const level = Number(formData.get("level"));
  const status = formData.get("status");
  const note = readString(formData, "note") || null;
  const explanation = readLocalized(formData, "explanation");
  const translation = readLocalized(formData, "translation");

  let options: unknown;
  try {
    options = JSON.parse(String(formData.get("options") ?? ""));
  } catch {
    return { error: "Варианты ответа не разобрались — обновите страницу" };
  }

  if (!verbId) return { error: "Выберите глагол" };
  if (![1, 2, 3].includes(level)) return { error: "Уровень — от 1 до 3" };
  if (!isSentenceStatus(status)) return { error: "Неизвестный статус" };

  // Тот же валидатор, что у сида: формат пропусков описан в одном месте.
  const problems = validateSentence(text, options);
  if (problems.length > 0) return { error: "Предложение не прошло проверку", problems };

  const data = {
    verbId,
    text,
    options: options as Prisma.InputJsonValue,
    level,
    status,
    note,
    // Пустой перевод/разбор храним как NULL: тренажёр тогда просто не рисует блок.
    explanation: Object.keys(explanation).length > 0 ? explanation : Prisma.DbNull,
    translation: Object.keys(translation).length > 0 ? translation : Prisma.DbNull,
    updatedById: session.user.id,
  };

  try {
    if (id) {
      await prisma.verbSentence.update({ where: { id }, data });
    } else {
      await prisma.verbSentence.create({ data: { ...data, createdById: session.user.id } });
    }
  } catch (error) {
    const known = knownError(error, {
      P2002: "У этого глагола уже есть такое предложение",
      P2003: STALE_LINK,
      P2025: "Предложение удалено — его уже нельзя сохранить",
    });
    if (known) return known;
    throw error;
  }

  revalidateAll();
  redirect("/admin/sentences");
}

export async function deleteSentence(id: string) {
  await assertAdmin();
  try {
    await prisma.verbSentence.delete({ where: { id } });
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
  revalidateAll();
  redirect("/admin/sentences");
}

// ── Пользователи ────────────────────────────────────────────────────────────

/**
 * Смена роли. Свою роль менять нельзя, а последнего админа разжаловать
 * нельзя никому: иначе в админку больше никто не войдёт. Проверка и запись
 * идут в serializable-транзакции — два админа, одновременно снимающие друг
 * друга, иначе оба увидели бы «есть ещё один админ» и оба прошли бы.
 *
 * Права проверяются в обход кеша сессии (getFreshSession), поэтому снятая
 * роль закрывает админку сразу, без пятиминутной задержки.
 */
export async function setUserRole(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertAdmin();
  const role = formData.get("role");

  if (!(roles as readonly unknown[]).includes(role)) return { error: "Неизвестная роль" };
  if (userId === session.user.id) return { error: "Свою роль менять нельзя" };

  let lastAdmin = false;
  try {
    await prisma.$transaction(
      async (tx) => {
        if (role !== "admin") {
          const otherAdmins = await tx.user.count({
            where: { role: "admin", id: { not: userId } },
          });
          if (otherAdmins === 0) {
            lastAdmin = true;
            return;
          }
        }
        await tx.user.update({ where: { id: userId }, data: { role: role as Role } });
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    const known = knownError(error, { P2025: "Пользователь удалён — обновите страницу" });
    if (known) return known;
    // P2034 — конфликт с параллельной сменой ролей: Postgres откатил одну из них.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { error: "Роли меняли одновременно — обновите страницу и повторите" };
    }
    throw error;
  }

  if (lastAdmin) return { error: "Это последний админ — разжаловать нельзя" };
  revalidatePath("/admin/users");
  return { saved: true };
}

// ── Тренажёры ───────────────────────────────────────────────────────────────

/**
 * Тексты тренажёра: название, описание и settings по локалям.
 *
 * Шаги инструкции общие для всех языков (порядок и иконка), различаются
 * только тексты. Английский заполняется целиком. Для остальных языков
 * храним ровно то, что ввёл админ: пустое поле остаётся пустым, а английский
 * подставляет resolveSettings() на странице тренажёра при показе. Если бы
 * подстановка шла при сохранении, копия английского выглядела бы в форме как
 * перевод и не обновлялась бы вслед за правкой оригинала.
 */
export async function saveTrainer(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const name = readLocalized(formData, "name");
  const description = readLocalized(formData, "description");
  const hint = readLocalized(formData, "hint");

  let rawSteps: unknown;
  try {
    rawSteps = JSON.parse(String(formData.get("steps") ?? ""));
  } catch {
    return { error: "Шаги не разобрались — обновите страницу" };
  }
  const steps = parseSteps(rawSteps);
  if (!steps) return { error: "Шаги не разобрались — обновите страницу" };

  if (!hasDefaultLocale(name)) return { error: "Нужно хотя бы английское название" };
  if (!hint[defaultLocale]) return { error: "Нужна английская подсказка" };
  if (steps.length === 0) return { error: "Добавьте хотя бы один шаг инструкции" };

  const problems = steps.flatMap((step, index) =>
    step.name[defaultLocale] ? [] : [`Шаг ${index + 1}: нет английского названия`],
  );
  if (problems.length > 0) return { error: "Инструкция заполнена не полностью", problems };

  const settings: Record<string, TrainerSettings> = {};
  for (const locale of locales) {
    const hasAny =
      hint[locale] || steps.some((step) => step.name[locale] || step.description[locale]);
    if (!hasAny) continue;
    settings[locale] = {
      hint: hint[locale] ?? "",
      steps: steps.map((step, index) => ({
        position: index + 1,
        icon: step.icon,
        name: step.name[locale] ?? "",
        description: step.description[locale] ?? "",
      })),
    };
  }

  try {
    await prisma.trainer.update({ where: { id }, data: { name, description, settings } });
  } catch (error) {
    const known = knownError(error, { P2025: "Тренажёр удалён — обновите страницу" });
    if (known) return known;
    throw error;
  }

  revalidateAll();
  return { saved: true };
}

type StepInput = {
  icon: string;
  name: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
};

/** Шаги из скрытого поля формы: проверяем форму, тексты обрезаем. */
function parseSteps(value: unknown): StepInput[] | null {
  if (!Array.isArray(value)) return null;
  const pickTexts = (raw: unknown) => {
    const result: Partial<Record<Locale, string>> = {};
    if (!raw || typeof raw !== "object") return result;
    for (const locale of locales) {
      const text = (raw as Record<string, unknown>)[locale];
      if (typeof text === "string" && text.trim()) result[locale] = text.trim();
    }
    return result;
  };
  const steps: StepInput[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const step = raw as Record<string, unknown>;
    if (typeof step.icon !== "string") return null;
    steps.push({
      icon: step.icon,
      name: pickTexts(step.name),
      description: pickTexts(step.description),
    });
  }
  return steps;
}
