"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { IconTrophy } from "../icons";
import { fadeUp, pop, stagger } from "../motion/presets";
import { AnimatedNumber } from "../primitives/animated-number";
import { Card } from "../primitives/card";
import { IconTile } from "../primitives/icon-tile";
import { Illustration } from "../primitives/illustration";
import { type Tone, toneText } from "../tones";

export type SessionSummaryProps = {
  title: string;
  text: string;
  stats: Array<{ value: number; label: string; tone: Tone }>;
  /** Кнопки «Ещё раз» / «Назад». */
  actions: React.ReactNode;
  illustration?: { src: string; alt: string };
  className?: string;
};

/** Экран итогов сессии: награда, счёт и действия. */
export function SessionSummary({ title, text, stats, actions, illustration, className }: SessionSummaryProps) {
  const trophy = <IconTile icon={IconTrophy} tone="gold" variant="solid" size="xl" className="shadow-glow-gold" />;
  return (
    <Card padding="lg" className={cn("overflow-hidden text-center", className)}>
      <div className="bg-aurora pointer-events-none absolute inset-x-0 top-0 h-40 opacity-80" />
      <m.div variants={stagger(0.08)} initial="hidden" animate="show" className="relative flex flex-col items-center">
        <m.div variants={pop} className="flex h-36 items-end justify-center">
          {illustration ? (
            <Illustration src={illustration.src} alt={illustration.alt} width={288} height={288} className="w-36" fallback={trophy} />
          ) : (
            trophy
          )}
        </m.div>
        <m.h2 variants={fadeUp} className="t-title mt-4 text-fg-strong">
          {title}
        </m.h2>
        <m.p variants={fadeUp} className="t-body mt-1.5 text-fg-muted">
          {text}
        </m.p>

        <m.dl variants={fadeUp} className="mt-6 grid w-full divide-x divide-hairline rounded-lg bg-surface-sunken/60 py-4" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center gap-1 px-2">
              <dt className="t-caption text-fg-muted">{s.label}</dt>
              <dd className={cn("t-stat", toneText[s.tone])}>
                <AnimatedNumber value={s.value} />
              </dd>
            </div>
          ))}
        </m.dl>

        <m.div variants={fadeUp} className="mt-6 flex w-full flex-col gap-3">
          {actions}
        </m.div>
      </m.div>
    </Card>
  );
}
