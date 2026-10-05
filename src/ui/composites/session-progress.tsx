import { cn } from "../cn";
import { ProgressBar } from "../primitives/progress-bar";
import type { Tone } from "../tones";

export type SessionProgressProps = {
  /** Номер текущего задания, с 1. */
  current: number;
  total: number;
  /** Подпись для скринридера: название тренажёра. */
  label: string;
  tone?: Tone;
  className?: string;
};

/** Прогресс тренировочной сессии: полоса с бликом и счётчик «3 / 20». */
export function SessionProgress({ current, total, label, tone = "ink", className }: SessionProgressProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ProgressBar value={total > 0 ? (current / total) * 100 : 0} tone={tone} size="sm" shimmer className="min-w-0 flex-1" label={label} />
      <span className="t-label shrink-0 text-fg-strong tabular-nums">
        {current}
        <span className="font-normal text-fg-faint"> / {total}</span>
      </span>
    </div>
  );
}
