"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { IconCorrect, IconWrong } from "../icons";
import { shake } from "../motion/presets";

export type ChoiceState = "idle" | "right" | "wrong" | "muted";

export type ChoiceOptionProps = {
  /** Метка варианта: a, b, c. */
  letter: string;
  state: ChoiceState;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
  className?: string;
};

const box: Record<ChoiceState, string> = {
  idle: "bg-surface ring-hairline-strong shadow-press-paper hover:bg-ink-50/50 active:translate-y-1 active:shadow-none",
  right: "bg-leaf-50 ring-leaf-400 shadow-[0_4px_0_0_var(--color-leaf-300)]",
  wrong: "bg-berry-50 ring-berry-400 shadow-[0_4px_0_0_var(--color-berry-300)]",
  muted: "bg-surface ring-hairline opacity-55",
};

const chip: Record<ChoiceState, string> = {
  idle: "bg-surface-sunken text-fg-muted",
  right: "bg-leaf-500 text-white",
  wrong: "bg-berry-500 text-white",
  muted: "bg-surface-sunken text-fg-faint",
};

/**
 * Вариант ответа в тестовых тренажёрах: тактильная кнопка с буквой.
 * После ответа верный «подпрыгивает» зелёным, ошибочный трясётся красным.
 */
export function ChoiceOption({ letter, state, onClick, disabled, pressed, children, className }: ChoiceOptionProps) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      // Пружина умеет только два кадра, поэтому «подпрыгивание» верного — обычный tween.
      animate={
        state === "wrong"
          ? shake
          : state === "right"
            ? { scale: [1, 1.04, 1], transition: { duration: 0.35, ease: "easeOut" } }
            : undefined
      }
      className={cn(
        "focus-ring flex w-full items-center gap-3.5 rounded-lg p-3.5 text-left ring-2 ring-inset transition-[background-color,box-shadow,translate,opacity] duration-150",
        box[state],
        className,
      )}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-sm text-sm font-bold transition-colors", chip[state])}>
        {letter}
      </span>
      <span className="t-verb min-w-0 flex-1 text-lg text-fg-strong">{children}</span>
      {state === "right" && <IconCorrect size={24} weight="fill" className="shrink-0 text-leaf-600" aria-hidden />}
      {state === "wrong" && <IconWrong size={24} weight="fill" className="shrink-0 text-berry-600" aria-hidden />}
    </m.button>
  );
}
