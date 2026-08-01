/**
 * Языки и форматирование строк. Модуль не обращается к запросу, поэтому его
 * можно импортировать и на сервере, и в клиентских компонентах — благодаря
 * этому список языков не приходится дублировать в переключателе.
 *
 * Определение языка текущего запроса — в server-only `i18n.ts`.
 */

export const locales = ["en", "be", "uk", "pl", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Имя cookie с выбранным языком. */
export const LOCALE_COOKIE = "lang";

/** Подписи для переключателя языка. */
export const localeNames: Record<Locale, string> = {
  en: "EN",
  be: "BE",
  uk: "UK",
  pl: "PL",
  ru: "RU",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Подстановка значений в строку словаря: "Ещё {count} глаголов". */
export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Формы слова по числу. Нужный набор ключей задаёт язык: у английского это
 * one/other, у русского и беларуского — one/few/many (1 глагол, 2 глагола,
 * 5 глаголов). Отсутствующая форма падает на `other`.
 */
export type PluralForms = {
  one?: string;
  few?: string;
  many?: string;
  other: string;
};

// Intl.PluralRules — не самый дешёвый в создании объект, а языков всего пять.
const pluralRules = new Map<Locale, Intl.PluralRules>();

export function plural(locale: Locale, count: number, forms: PluralForms) {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }

  const category = rules.select(count) as keyof PluralForms;
  return interpolate(forms[category] ?? forms.other, { count });
}
