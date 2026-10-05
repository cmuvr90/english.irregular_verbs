"use client";

import type { HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { spring } from "../motion/presets";

export type IconButtonVariant = "paper" | "glass" | "soft" | "ghost" | "tint";

const variants: Record<IconButtonVariant, string> = {
  paper: "bg-surface text-fg-muted shadow-sm ring-1 ring-hairline hover:text-ink-600",
  glass: "glass text-fg shadow-sm hover:text-ink-600",
  soft: "bg-ink-50 text-ink-600 hover:bg-ink-100",
  ghost: "text-fg-muted hover:bg-ink-50 hover:text-ink-600",
  // Для цветных карточек: полупрозрачное светлое стекло.
  tint: "glass-tint text-white hover:bg-white/25",
};

const sizes = { sm: "size-9", md: "size-11", lg: "size-14" } as const;
export const iconSizes = { sm: 18, md: 22, lg: 26 } as const;

/** Классы круглой кнопки-иконки — общие с IconButtonLink. */
export function iconButtonClass(variant: IconButtonVariant = "paper", size: keyof typeof sizes = "md", className?: string) {
  return cn(
    "focus-ring relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export type IconButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  icon: Icon;
  /** Обязательная подпись: у кнопки нет текста, скринридеру нужно имя. */
  label: string;
  variant?: IconButtonVariant;
  size?: keyof typeof sizes;
  /** Счётчик-бейдж в углу (уведомления). */
  badge?: number;
};

export function IconButton({
  icon: Glyph,
  label,
  variant = "paper",
  size = "md",
  badge,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <m.button
      type={type}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.9 }}
      transition={spring.snappy}
      className={iconButtonClass(variant, size, className)}
      {...rest}
    >
      <Glyph size={iconSizes[size]} weight="regular" aria-hidden />
      {!!badge && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-berry-500 px-1 text-[10px] font-bold text-white ring-2 ring-canvas">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </m.button>
  );
}
