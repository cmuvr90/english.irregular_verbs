import { defaultLocale, locales, type Locale } from "@/lib/locales";

/**
 * Общие куски форм админки. Отдельно от admin-actions.ts: файл с "use server"
 * может экспортировать только async-функции, а типы и парсеры нужны и
 * экшенам, и клиентским формам.
 */

/** Ответ экшена для useActionState: пустой объект — ошибок нет. */
export type ActionState = {
  error?: string;
  /** Список проблем валидатора (например, validateSentence). */
  problems?: string[];
  /** Форма осталась на странице и сохранилась — показать «Сохранено». */
  saved?: boolean;
};

export const initialActionState: ActionState = {};

/** Имя поля формы для перевода: "translation.ru". */
export function localizedFieldName(field: string, locale: Locale) {
  return `${field}.${locale}`;
}

/**
 * Собирает json-перевод {"en": "...", "ru": "..."} из полей field.<locale>.
 * Пустые строки отбрасываем: pickLocalized() сам упадёт на язык по умолчанию.
 */
export function readLocalized(formData: FormData, field: string) {
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    const value = String(formData.get(localizedFieldName(field, locale)) ?? "").trim();
    if (value) result[locale] = value;
  }
  return result;
}

/** Перевод обязателен хотя бы на язык по умолчанию — на него падает pickLocalized(). */
export function hasDefaultLocale(value: Partial<Record<Locale, string>>) {
  return Boolean(value[defaultLocale]);
}

/** Json-поле из БД → карта строк для defaultValue инпутов. */
export function toLocalizedMap(value: unknown): Partial<Record<Locale, string>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const map = value as Record<string, unknown>;
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    if (typeof map[locale] === "string") result[locale] = map[locale];
  }
  return result;
}

/**
 * Параметр адреса как строка. Next отдаёт массив, если параметр повторён
 * (?q=a&q=b), — без нормализации .trim() на массиве ронял бы страницу.
 */
export function searchParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export const sentenceStatuses = ["draft", "published", "archived"] as const;

export type SentenceStatusValue = (typeof sentenceStatuses)[number];

export const sentenceStatusLabels: Record<SentenceStatusValue, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  archived: "В архиве",
};

export function isSentenceStatus(value: unknown): value is SentenceStatusValue {
  return (sentenceStatuses as readonly unknown[]).includes(value);
}
