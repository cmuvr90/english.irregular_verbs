"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { type Icon, IconLock } from "../icons";
import { spring } from "../motion/presets";
import { ProgressBar } from "../primitives/progress-bar";
import { type Tone, toneGradient } from "../tones";

export type AchievementBadgeProps = {
  icon: Icon;
  title: string;
  description?: string;
  tone?: Tone;
  /** 0–100; 100 — получено. Меньше — медаль заблокирована и показывает прогресс. */
  progress: number;
  className?: string;
};

/** Медаль достижения: получена — градиент со свечением, иначе — замок и прогресс. */
export function AchievementBadge({ icon: Glyph, title, description, tone = "gold", progress, className }: AchievementBadgeProps) {
  const earned = progress >= 100;
  return (
    <div className={cn("flex w-28 flex-col items-center gap-2 text-center", className)}>
      <m.div
        whileHover={earned ? { rotate: [0, -6, 6, -3, 0], scale: 1.06 } : { scale: 1.03 }}
        transition={earned ? { duration: 0.5 } : spring.snappy}
        className={cn(
          "relative flex size-20 items-center justify-center rounded-[1.75rem]",
          earned ? cn("grain inset-shadow-highlight shadow-glow-gold", toneGradient[tone]) : "bg-surface-sunken text-fg-faint inset-shadow-sunken",
        )}
      >
        <Glyph size={38} weight={earned ? "fill" : "duotone"} aria-hidden />
        {!earned && (
          <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-surface text-fg-muted shadow-sm ring-1 ring-hairline">
            <IconLock size={14} weight="bold" aria-hidden />
          </span>
        )}
      </m.div>
      <div>
        <p className={cn("t-label", earned ? "text-fg-strong" : "text-fg-muted")}>{title}</p>
        {description && <p className="t-caption mt-0.5 text-fg-faint">{description}</p>}
      </div>
      {!earned && <ProgressBar value={progress} tone="gold" size="xs" className="w-16" label={title} />}
    </div>
  );
}
