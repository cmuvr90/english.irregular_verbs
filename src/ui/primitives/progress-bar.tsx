"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { spring } from "../motion/presets";
import { type Tone, toneGradient } from "../tones";

const heights = { xs: "h-1.5", sm: "h-2.5", md: "h-3.5", lg: "h-5" } as const;

export type ProgressBarProps = {
  /** 0–100 */
  value: number;
  tone?: Tone;
  size?: keyof typeof heights;
  /** Бегущий блик по заполненной части — для «живого» прогресса (сессия идёт). */
  shimmer?: boolean;
  /** Подпись для скринридера: «Дневная цель». */
  label: string;
  className?: string;
};

/** Полоса прогресса в утопленном треке; заливка доезжает пружиной. */
export function ProgressBar({ value, tone = "ink", size = "sm", shimmer, label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("overflow-hidden rounded-full bg-surface-sunken inset-shadow-sunken", heights[size], className)}
    >
      <m.div
        className={cn("relative h-full origin-left rounded-full inset-shadow-highlight", toneGradient[tone], shimmer && "shimmer")}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={spring.progress}
      />
    </div>
  );
}
