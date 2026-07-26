import "server-only";

import type { Locale } from "@/lib/i18n";

import type { Dictionary } from "./en";

/**
 * Словари подгружаются по требованию: в клиентский бандл попадают только те
 * строки, которые компонент получил пропсами, а не все три перевода.
 */
const dictionaries = {
  en: () => import("./en").then((m) => m.default),
  be: () => import("./be").then((m) => m.default),
  ru: () => import("./ru").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const getDictionary = (locale: Locale) => dictionaries[locale]();

export type { Dictionary };
