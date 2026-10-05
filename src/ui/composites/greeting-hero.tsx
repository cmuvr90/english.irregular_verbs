"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { fadeUp, stagger } from "../motion/presets";
import { Badge } from "../primitives/badge";
import { Illustration } from "../primitives/illustration";
import { IconWave } from "../icons";

export type GreetingHeroProps = {
  greeting: string;
  note: string;
  /** Метка уровня/статуса над приветствием. */
  badge?: string;
  illustration?: { src: string; alt: string };
  /** Замена, пока файла иллюстрации нет (например, SVG-маскот). */
  fallback?: React.ReactNode;
  className?: string;
};

/** Приветствие на «северном сиянии» с иллюстрацией маскота справа. */
export function GreetingHero({ greeting, note, badge, illustration, fallback, className }: GreetingHeroProps) {
  return (
    <section className={cn("bg-aurora animate-aurora grain relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-white/70 [--grain-opacity:0.12]", className)}>
      <div className="flex items-center">
        <m.div variants={stagger(0.08)} initial="hidden" animate="show" className="relative min-w-0 flex-1 py-6 pl-6">
          {badge && (
            <m.div variants={fadeUp}>
              <Badge tone="ink" variant="outline" size="sm" icon={IconWave}>
                {badge}
              </Badge>
            </m.div>
          )}
          <m.h1 variants={fadeUp} className="t-title mt-3 text-fg-strong">
            {greeting}
          </m.h1>
          <m.p variants={fadeUp} className="t-body-sm mt-2 text-fg-muted">
            {note}
          </m.p>
        </m.div>
        {illustration && (
          <m.div
            initial={{ opacity: 0, x: 24, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.15 }}
            className="animate-float relative -mr-2 w-40 shrink-0 self-end"
          >
            <Illustration src={illustration.src} alt={illustration.alt} width={320} height={320} eager placeholder="mascot-wave.webp" fallback={fallback} className="rounded-none bg-transparent" />
          </m.div>
        )}
      </div>
    </section>
  );
}
