"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setLocale } from "@/lib/locale-actions";
import { type Locale, localeNames, locales } from "@/lib/locales";

/**
 * Переключатель языка: сегментированный контрол по числу поддерживаемых языков.
 * Язык хранится в cookie, поэтому после смены обновляем серверные компоненты.
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Оптимистично подсвечиваем выбранный язык, не дожидаясь ответа сервера.
  const [selected, setSelected] = useState(current);

  return (
    <div
      className={`inline-flex rounded-full border border-line/60 bg-white p-0.5 ${
        pending ? "opacity-60" : ""
      }`}
    >
      {locales.map((locale) => {
        const active = locale === selected;
        return (
          <button
            key={locale}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => {
              if (active) return;
              setSelected(locale);
              startTransition(async () => {
                try {
                  await setLocale(locale);
                  router.refresh();
                } catch {
                  // Не удалось сохранить — возвращаем подсветку на текущий язык,
                  // иначе кнопка врёт о состоянии интерфейса.
                  setSelected(current);
                }
              });
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? "bg-blue-600 text-white" : "text-subtle hover:text-foreground"
            }`}
          >
            {localeNames[locale]}
          </button>
        );
      })}
    </div>
  );
}
