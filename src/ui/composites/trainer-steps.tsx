"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { fadeUp, stagger } from "../motion/presets";
import { IconTile } from "../primitives/icon-tile";
import type { Tone } from "../tones";

export type TrainerStep = {
  position: number;
  name: string;
  description: string;
  icon: Icon;
};

export type TrainerStepsProps = {
  steps: TrainerStep[];
  /** Заголовок над шагами: «Как работает тренажёр». */
  title?: string;
  className?: string;
};

// Шаги идут «по небу»: рассвет → закат → сумерки, дальше по кругу.
const stepTones: Tone[] = ["v1", "v2", "v3"];

/** Инструкция «как работает тренажёр»: пронумерованные шаги с иконками. */
export function TrainerSteps({ steps, title, className }: TrainerStepsProps) {
  return (
    <section className={className}>
      {title && <h2 className="t-overline mb-3 text-fg-muted">{title}</h2>}
      <m.ol variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <m.li
            key={step.position}
            variants={fadeUp}
            className="flex items-center gap-3.5 rounded-xl bg-surface p-3.5 shadow-sm ring-1 ring-hairline/70"
          >
            <span className="relative">
              <IconTile icon={step.icon} tone={stepTones[i % stepTones.length]} size="md" />
              <span
                className={cn(
                  "absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-fg-strong shadow-sm ring-1 ring-hairline",
                )}
              >
                {step.position}
              </span>
            </span>
            <span className="min-w-0">
              <span className="t-label block font-semibold text-fg-strong">{step.name}</span>
              <span className="t-caption block text-fg-muted">{step.description}</span>
            </span>
          </m.li>
        ))}
      </m.ol>
    </section>
  );
}
