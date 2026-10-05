import { extendTailwindMerge } from "tailwind-merge";

/**
 * Склейка классов с разрешением конфликтов: className снаружи перебивает
 * базовые классы примитива (p-4 + p-6 → p-6). Свои типографские утилиты
 * t-* объявлены группой размера шрифта, иначе twMerge не знает,
 * что t-title и text-sm конфликтуют.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { t: ["display", "title", "heading", "subheading", "body", "body-sm", "label", "caption", "overline", "stat"] },
      ],
    },
  },
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes);
}
