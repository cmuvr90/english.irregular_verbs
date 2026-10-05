import { cn } from "../cn";

/*
 * Стили кнопки отдельно от компонента: модуль без "use client", поэтому
 * buttonClass() можно вызывать и в серверных компонентах — например,
 * чтобы оформить next/link как кнопку.
 */

export type ButtonVariant = "primary" | "success" | "danger" | "secondary" | "inverse" | "soft" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Тактильные варианты (primary/success/danger/secondary) стоят на цветном
 * бортике и при нажатии «проваливаются» на его высоту — через CSS-свойство
 * translate, которое не конфликтует с transform от motion.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-600 text-white shadow-press-ink inset-shadow-highlight hover:bg-ink-500 active:translate-y-1 active:shadow-none",
  success:
    "bg-leaf-600 text-white shadow-press-leaf inset-shadow-highlight hover:bg-leaf-500 active:translate-y-1 active:shadow-none",
  danger:
    "bg-berry-600 text-white shadow-press-berry inset-shadow-highlight hover:bg-berry-500 active:translate-y-1 active:shadow-none",
  secondary:
    "bg-surface text-fg-strong ring-1 ring-hairline-strong shadow-press-paper hover:bg-surface-sunken/50 active:translate-y-1 active:shadow-none",
  // Белая кнопка на цветных карточках (герой «Продолжить обучение»).
  inverse:
    "bg-white text-ink-700 shadow-[0_4px_0_0_oklch(30%_0.1_266/0.35)] hover:bg-ink-50 active:translate-y-1 active:shadow-none",
  soft: "bg-ink-50 text-ink-700 hover:bg-ink-100",
  ghost: "text-fg-muted hover:bg-ink-50 hover:text-ink-700",
};

export const tactile: Record<ButtonVariant, boolean> = {
  primary: true,
  success: true,
  danger: true,
  secondary: true,
  inverse: true,
  soft: false,
  ghost: false,
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-sm px-3.5 text-[13px]",
  md: "h-12 gap-2 rounded-md px-5 text-[15px]",
  lg: "h-14 gap-2.5 rounded-lg px-7 text-base",
};

export const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 22 };

/** Классы кнопки отдельно — чтобы так же оформить next/link (см. ButtonLink в историях). */
export function buttonClass({
  variant = "primary",
  size = "md",
  block,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(
    "focus-ring relative inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap select-none",
    "transition-[background-color,box-shadow,translate,color] duration-150 ease-out",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:saturate-50",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );
}
