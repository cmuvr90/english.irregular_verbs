import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

export const locales = ["en", "be", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Имя cookie с выбранным языком — читается и на сервере, и в Server Action. */
export const LOCALE_COOKIE = "lang";

export const localeNames: Record<Locale, string> = {
  en: "EN",
  be: "BE",
  ru: "RU",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Язык текущего запроса: выбор пользователя из cookie, иначе — язык браузера.
 * `cache` схлопывает вызовы из разных компонентов одного рендера.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return matchAcceptLanguage((await headers()).get("accept-language"));
});

/** Разбор Accept-Language: сортируем по q-весу и берём первый поддерживаемый. */
function matchAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        // "ru-RU" и "ru" считаем одним языком
        tag: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number.parseFloat(q.split("=")[1]) || 0 : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

/** Подстановка значений в строку словаря: "Ещё {count} глаголов" */
export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
