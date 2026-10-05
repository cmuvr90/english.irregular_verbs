"use client";

import * as m from "motion/react-m";
import { useId } from "react";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { spring } from "../motion/presets";

export type SegmentOption<T extends string> = { value: T; label: string; icon?: Icon };

export type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
};

/** Переключатель режимов: активная «пилюля» перетекает между вариантами (layoutId). */
export function SegmentedControl<T extends string>({ options, value, onChange, label, size = "md", className }: SegmentedControlProps<T>) {
  // Свой layoutId на каждый экземпляр, иначе пилюли двух контролов на экране перелетали бы друг в друга.
  const pillId = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full bg-surface-sunken p-1 inset-shadow-sunken", className)}
    >
      {options.map(({ value: v, label: text, icon: Glyph }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "focus-ring relative flex flex-1 items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
              active ? "text-fg-strong" : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <m.span
                layoutId={pillId}
                className="absolute inset-0 rounded-full bg-surface shadow-md ring-1 ring-hairline/60"
                transition={spring.snappy}
              />
            )}
            {Glyph && <Glyph size={size === "sm" ? 14 : 16} weight={active ? "fill" : "regular"} className="relative" aria-hidden />}
            <span className="relative">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
