"use client";

import * as m from "motion/react-m";
import { useId } from "react";

import { cn } from "../cn";
import { spring } from "../motion/presets";
import { type Tone, toneStops } from "../tones";

export type ProgressRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  thickness?: number;
  tone?: Tone;
  /** На цветной карточке трек делаем полупрозрачным белым. */
  onColor?: boolean;
  label: string;
  /** Содержимое в центре; по умолчанию — процент. */
  children?: React.ReactNode;
  className?: string;
};

/** Кольцо прогресса с градиентной дугой; дуга дорисовывается пружиной (pathLength). */
export function ProgressRing({
  value,
  size = 80,
  thickness = 8,
  tone = "ink",
  onColor,
  label,
  children,
  className,
}: ProgressRingProps) {
  // Из useId убираем спецсимволы: id попадает в url(#…), а CSS.escape на сервере недоступен.
  const id = `ring${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - thickness) / 2;
  const [from, to] = onColor ? ["#ffffff", "var(--color-leaf-200)"] : toneStops[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          className={onColor ? "stroke-white/20" : "stroke-surface-sunken"}
        />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped / 100 }}
          transition={spring.progress}
        />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center", onColor ? "text-white" : "text-fg-strong")}>
        {children ?? <span className="t-verb text-sm font-semibold">{Math.round(clamped)}%</span>}
      </span>
    </div>
  );
}
