import { Geist, Geist_Mono, Unbounded } from "next/font/google";

/**
 * Шрифты приложения в одном месте: их подключает и корневой layout, и превью
 * Storybook — иначе истории рисовались бы системным шрифтом.
 *
 * - Geist — основной текст интерфейса;
 * - Unbounded — акцидентный: заголовки, цифры статистики, формы глаголов;
 * - Geist Mono — служебные подписи и коды.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${unbounded.variable}`;
