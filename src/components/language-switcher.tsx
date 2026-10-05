"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setLocale } from "@/lib/locale-actions";
import { type Locale, localeNames, locales } from "@/lib/locales";
import { cn } from "@/ui/cn";
import { SegmentedControl } from "@/ui/primitives/segmented-control";

/**
 * Переключатель языка: сегментированный контрол по числу поддерживаемых языков.
 * Язык хранится в cookie, поэтому после смены обновляем серверные компоненты.
 */
export function LanguageSwitcher({
  current,
  label,
  className,
}: {
  current: Locale;
  /** Подпись группы для скринридера: «Язык». */
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Оптимистично подсвечиваем выбранный язык, не дожидаясь ответа сервера.
  const [selected, setSelected] = useState(current);

  return (
    <SegmentedControl
      label={label}
      size="sm"
      value={selected}
      options={locales.map((locale) => ({ value: locale, label: localeNames[locale] }))}
      onChange={(locale) => {
        if (locale === selected || pending) return;
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
      className={cn(pending && "opacity-60", className)}
    />
  );
}
