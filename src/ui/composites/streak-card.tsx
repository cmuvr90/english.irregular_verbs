"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { IconCheck, IconStreak } from "../icons";
import { pop, stagger } from "../motion/presets";
import { Card } from "../primitives/card";

export type StreakDay = {
  /** Короткая подпись дня недели: «Пн». */
  label: string;
  state: "done" | "today" | "missed" | "future";
};

export type StreakCardProps = {
  days: number;
  /** «дней подряд» — уже с правильной формой множественного числа. */
  caption: string;
  week: StreakDay[];
  /** Мотивационная строка под неделей. */
  note?: string;
  className?: string;
};

/** Серия дней: «живой» огонь и неделя из семи отметок. */
export function StreakCard({ days, caption, week, note, className }: StreakCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* тёплое пятно за огнём */}
      <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-grad-sunset opacity-20 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <span className="relative flex size-16 shrink-0 items-center justify-center">
          <span className="absolute inset-1 rounded-full bg-grad-flame opacity-30 blur-md" />
          <IconStreak size={52} weight="fill" className="animate-flicker relative text-coral-500 drop-shadow-[0_4px_8px_oklch(70%_0.19_36/0.45)]" aria-hidden />
        </span>
        <div>
          <p className="t-display text-grad-flame leading-none">{days}</p>
          <p className="t-label mt-1 text-fg-muted">{caption}</p>
        </div>
      </div>

      <m.ol
        variants={stagger(0.05, 0.15)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative mt-5 grid grid-cols-7 gap-1.5"
      >
        {week.map((d, i) => (
          <m.li key={i} variants={pop} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                d.state === "done" && "grain bg-grad-flame text-white shadow-sm",
                d.state === "today" && "bg-coral-50 text-coral-600 ring-2 ring-coral-400 ring-offset-2 ring-offset-surface",
                d.state === "missed" && "bg-surface-sunken text-fg-faint inset-shadow-sunken",
                d.state === "future" && "border-2 border-dashed border-hairline-strong",
              )}
            >
              {d.state === "done" && <IconCheck size={16} weight="bold" aria-hidden />}
              {d.state === "today" && <IconStreak size={16} weight="fill" aria-hidden />}
            </span>
            <span className={cn("t-caption", d.state === "today" ? "font-semibold text-coral-600" : "text-fg-faint")}>{d.label}</span>
          </m.li>
        ))}
      </m.ol>

      {note && <p className="t-body-sm relative mt-4 text-fg-muted">{note}</p>}
    </Card>
  );
}
