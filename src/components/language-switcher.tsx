"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Locale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale-actions";

const options: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "be", label: "BE" },
  { value: "ru", label: "RU" },
];

/**
 * Переключатель языка: сегментированный контрол на три кнопки.
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
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => {
              if (active) return;
              setSelected(option.value);
              startTransition(async () => {
                await setLocale(option.value);
                router.refresh();
              });
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? "bg-blue-600 text-white" : "text-subtle hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
