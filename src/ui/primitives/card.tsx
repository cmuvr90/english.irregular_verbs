"use client";

import type { HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "../cn";
import { spring } from "../motion/presets";
import { type Tone, toneGradient } from "../tones";

export type CardVariant = "paper" | "sunken" | "glass" | "gradient" | "outline" | "notebook";

const variants: Record<Exclude<CardVariant, "gradient">, string> = {
  paper: "bg-surface shadow-sm ring-1 ring-hairline/70",
  sunken: "bg-surface-sunken inset-shadow-sunken",
  glass: "glass shadow-float",
  outline: "border-grad bg-surface shadow-sm",
  notebook: "bg-notebook shadow-sm ring-1 ring-hairline/70",
};

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" } as const;

export type CardProps = HTMLMotionProps<"div"> & {
  variant?: CardVariant;
  /** Тон для variant="gradient". */
  tone?: Tone;
  padding?: keyof typeof paddings;
  /** Карточка-кнопка: приподнимается при наведении, пружинит при нажатии. */
  interactive?: boolean;
};

/**
 * Базовая поверхность. Белые карточки на бумажном фоне отделяются тенью
 * и еле заметной обводкой; цветные — градиентом с плёночным зерном.
 */
export function Card({
  variant = "paper",
  tone = "ink",
  padding = "md",
  interactive,
  className,
  ...rest
}: CardProps) {
  return (
    <m.div
      whileHover={interactive ? { y: -3 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={spring.snappy}
      className={cn(
        "relative rounded-xl",
        variant === "gradient" ? cn("grain overflow-hidden shadow-lg", toneGradient[tone]) : variants[variant],
        paddings[padding],
        interactive && "cursor-pointer transition-shadow duration-300 hover:shadow-lg",
        className,
      )}
      {...rest}
    />
  );
}
