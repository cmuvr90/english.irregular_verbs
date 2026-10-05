"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useId } from "react";

import { cn } from "../cn";
import type { Icon } from "../icons";

export type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  icon?: Icon;
  /** Элемент справа внутри поля: «глаз» пароля, очистка, кнопка-микрофон. */
  action?: React.ReactNode;
  hint?: string;
  error?: string | null;
  /** answer — крупное поле ввода ответа в тренажёрах, шрифт формы глагола. */
  variant?: "default" | "answer";
};

export function TextField({ label, icon: Glyph, action, hint, error, variant = "default", className, id, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-note`;
  const answer = variant === "answer";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="t-label text-fg">
          {label}
        </label>
      )}
      <div className="group relative">
        {Glyph && (
          <Glyph
            size={20}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-fg-faint transition-colors group-focus-within:text-ink-500"
          />
        )}
        <input
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? noteId : undefined}
          className={cn(
            "w-full rounded-md bg-surface text-fg-strong ring-1 ring-hairline-strong transition-[box-shadow,background-color] duration-200 outline-none placeholder:text-fg-faint",
            "focus:shadow-[0_0_0_4px_var(--color-ink-100)] focus:ring-2 focus:ring-ink-500",
            "aria-invalid:bg-berry-50/60 aria-invalid:ring-2 aria-invalid:ring-berry-400 aria-invalid:focus:shadow-[0_0_0_4px_var(--color-berry-100)]",
            answer ? "t-verb h-16 px-5 text-center text-2xl" : "h-12 px-4 text-[15px]",
            Glyph && "pl-12",
            !!action && "pr-12",
          )}
          {...rest}
        />
        {action && <div className="absolute inset-y-0 right-2 flex items-center">{action}</div>}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {(error || hint) && (
          <m.p
            key={error ? "error" : "hint"}
            id={noteId}
            role={error ? "alert" : undefined}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn("t-caption", error ? "text-berry-600" : "text-fg-muted")}
          >
            {error || hint}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}
