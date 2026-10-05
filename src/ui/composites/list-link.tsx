"use client";

import Link from "next/link";
import * as m from "motion/react-m";

import { cn } from "../cn";
import { type Icon, IconChevron } from "../icons";
import { spring } from "../motion/presets";
import { IconTile } from "../primitives/icon-tile";
import { ProgressBar } from "../primitives/progress-bar";
import type { Tone } from "../tones";

const MLink = m.create(Link);

export type ListLinkProps = {
  href: string;
  icon: Icon;
  tone: Tone;
  title: string;
  description?: string;
  /** Элемент рядом с заголовком: бейдж «Новый», статус. */
  badge?: React.ReactNode;
  /** 0–100 — полоса прогресса под описанием. */
  progress?: number;
  progressLabel?: string;
  className?: string;
};

/** Строка-ссылка списка: плашка с иконкой, заголовок, описание, стрелка. */
export function ListLink({ href, icon, tone, title, description, badge, progress, progressLabel, className }: ListLinkProps) {
  return (
    <MLink
      href={href}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={spring.snappy}
      className={cn(
        "focus-ring group flex items-center gap-4 rounded-xl bg-surface p-4 shadow-sm ring-1 ring-hairline/70 transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <IconTile icon={icon} tone={tone} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="t-subheading truncate text-fg-strong">{title}</p>
          {badge}
        </div>
        {description && <p className="t-caption mt-0.5 line-clamp-2 text-fg-muted">{description}</p>}
        {progress !== undefined && (
          <div className="mt-2.5 flex items-center gap-2">
            <ProgressBar value={progress} tone={tone} size="xs" className="flex-1" label={progressLabel ?? title} />
            <span className="t-caption font-semibold text-fg-muted tabular-nums">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
      <IconChevron size={18} weight="bold" className="shrink-0 text-fg-faint transition-colors group-hover:text-ink-500" aria-hidden />
    </MLink>
  );
}
