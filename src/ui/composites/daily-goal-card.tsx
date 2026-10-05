"use client";

import Link from "next/link";

import { cn } from "../cn";
import { IconCheck, IconGoal } from "../icons";
import { Card } from "../primitives/card";
import { ProgressBar } from "../primitives/progress-bar";
import { ProgressRing } from "../primitives/progress-ring";

export type DailyGoalCardProps = {
  title: string;
  subtitle: string;
  done: number;
  total: number;
  /** «глаголов» — подпись к числу. */
  unit: string;
  /** «Осталось 8 глаголов» — уже склонённая строка. */
  remaining: string;
  /** «Цель выполнена!» — показывается вместо remaining. */
  completeText: string;
  changeGoal?: { label: string; href: string };
  className?: string;
};

/** Цель дня: кольцо, счётчик и полоса; при выполнении карточка «зеленеет». */
export function DailyGoalCard({ title, subtitle, done, total, unit, remaining, completeText, changeGoal, className }: DailyGoalCardProps) {
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  const complete = done >= total;

  return (
    <Card className={cn(complete && "border-grad [--border-gradient:var(--gradient-leaf)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="t-heading text-fg-strong">{title}</h2>
          <p className="t-body-sm mt-0.5 text-fg-muted">{subtitle}</p>
        </div>
        {changeGoal && (
          <Link
            href={changeGoal.href}
            className="focus-ring t-label flex shrink-0 items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-ink-700 transition-colors hover:bg-ink-100"
          >
            <IconGoal size={16} weight="duotone" aria-hidden />
            {changeGoal.label}
          </Link>
        )}
      </div>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing value={percent} tone={complete ? "success" : "ink"} size={84} thickness={9} label={title}>
          {complete ? (
            <IconCheck size={30} weight="bold" className="text-success-600" aria-hidden />
          ) : (
            <IconGoal size={30} weight="duotone" className="text-ink-500" aria-hidden />
          )}
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-1.5">
            <span className={cn("t-stat text-4xl", complete ? "text-success-600" : "text-ink-600")}>{done}</span>
            <span className="t-subheading text-fg-faint">/ {total}</span>
            <span className="t-body-sm ml-1 text-fg-muted">{unit}</span>
          </p>
          <ProgressBar value={percent} tone={complete ? "success" : "v1"} className="mt-3" label={title} />
          <p className={cn("t-body-sm mt-2", complete ? "font-semibold text-success-700" : "text-fg-muted")}>
            {complete ? completeText : remaining}
          </p>
        </div>
      </div>
    </Card>
  );
}
