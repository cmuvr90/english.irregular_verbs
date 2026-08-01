import "server-only";

import { cache } from "react";

import type { Locale } from "@/lib/locales";

import type { Dictionary } from "./en";

/**
 * Словари подгружаются по требованию: в клиентский бандл попадают только те
 * строки, которые компонент получил пропсами, а не все переводы.
 */
const dictionaries = {
  en: () => import("./en").then((m) => m.default),
  be: () => import("./be").then((m) => m.default),
  uk: () => import("./uk").then((m) => m.default),
  pl: () => import("./pl").then((m) => m.default),
  ru: () => import("./ru").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

/** `cache` — словарь запрашивают и метаданные, и layout, и страница. */
export const getDictionary = cache((locale: Locale) => dictionaries[locale]());

export type { Dictionary };
