"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { fadeUp, stagger } from "../motion/presets";
import { AnimatedNumber } from "../primitives/animated-number";
import { Card } from "../primitives/card";
import { IconTile } from "../primitives/icon-tile";
import { type Tone, toneText } from "../tones";

export type Stat = {
  icon: Icon;
  tone: Tone;
  /** Число докручивается анимацией; строка (уровень «B1») выводится как есть. */
  value: number | string;
  label: string;
};

export function StatTile({ icon, tone, value, label, className }: Stat & { className?: string }) {
  return (
    <m.div variants={fadeUp} className={cn("flex flex-col items-center gap-2 px-1 text-center", className)}>
      <IconTile icon={icon} tone={tone} size="md" />
      <span className={cn("t-stat mt-0.5", toneText[tone])}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </span>
      <span className="t-caption leading-tight text-fg-muted">{label}</span>
    </m.div>
  );
}

/** Полоса статистики дашборда: плитки появляются по очереди, числа докручиваются. */
export function StatsStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <Card padding="sm" className={className}>
      <m.div
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid divide-x divide-hairline"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
      >
        {stats.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </m.div>
    </Card>
  );
}
