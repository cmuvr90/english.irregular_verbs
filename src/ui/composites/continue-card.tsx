"use client";

import Link from "next/link";

import { cn } from "../cn";
import { type Icon, IconNext } from "../icons";
import { buttonClass } from "../primitives/button-styles";
import { Card } from "../primitives/card";
import { ProgressRing } from "../primitives/progress-ring";

export type ContinueCardProps = {
  title: string;
  subtitle: string;
  trainer: { name: string; kind: string; icon: Icon };
  /** 0–100 — пройдено в текущей сессии тренажёра. */
  progress: number;
  action: { label: string; href: string };
  className?: string;
};

/**
 * Главная карточка дашборда — «продолжить обучение». Единственное место
 * экрана с плотным ультрамарином: глаз сразу находит, куда нажать.
 */
export function ContinueCard({ title, subtitle, trainer, progress, action, className }: ContinueCardProps) {
  const TrainerIcon = trainer.icon;
  return (
    <Card variant="gradient" tone="ink" padding="lg" className={cn("shadow-glow-ink", className)}>
      {/* закатное и сумеречное пятна — небо за окном */}
      <div className="animate-float pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-grad-sunset opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-grad-dawn opacity-40 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="t-heading">{title}</h2>
          <p className="t-body-sm mt-1 text-white/75">{subtitle}</p>
        </div>
        <ProgressRing value={progress} onColor size={72} thickness={7} label={title} />
      </div>

      <div className="glass-tint relative mt-5 flex items-center gap-4 rounded-lg p-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white text-v3-600 shadow-md">
          <TrainerIcon size={26} weight="duotone" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="t-subheading truncate">{trainer.name}</p>
          <p className="t-caption text-white/70">{trainer.kind}</p>
        </div>
      </div>

      <Link href={action.href} className={buttonClass({ variant: "inverse", size: "lg", block: true, className: "relative mt-5" })}>
        {action.label}
        <IconNext size={20} weight="bold" aria-hidden />
      </Link>
    </Card>
  );
}
