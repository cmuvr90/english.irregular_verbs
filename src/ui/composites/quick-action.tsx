"use client";

import Link from "next/link";
import * as m from "motion/react-m";

import { cn } from "../cn";
import { type Icon, IconChevron } from "../icons";
import { spring } from "../motion/presets";
import { IconTile } from "../primitives/icon-tile";
import type { Tone } from "../tones";

const MLink = m.create(Link);

export type QuickActionProps = {
  icon: Icon;
  tone: Tone;
  label: string;
  href: string;
  /** Короткая подпись под названием: «152 глагола». */
  hint?: string;
  className?: string;
};

/** Плитка быстрого доступа: иконка слегка «подпрыгивает» при наведении. */
export function QuickAction({ icon, tone, label, href, hint, className }: QuickActionProps) {
  return (
    <MLink
      href={href}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{ rest: { y: 0 }, hover: { y: -3 }, tap: { scale: 0.97 } }}
      transition={spring.snappy}
      className={cn(
        "focus-ring group flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-sm ring-1 ring-hairline/70 transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <m.span variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08 } }} transition={spring.bouncy}>
          <IconTile icon={icon} tone={tone} size="lg" />
        </m.span>
        <IconChevron size={16} weight="bold" className="mt-1 text-fg-faint transition-colors group-hover:text-ink-500" aria-hidden />
      </div>
      <div>
        <p className="t-subheading text-fg-strong">{label}</p>
        {hint && <p className="t-caption mt-0.5 text-fg-muted">{hint}</p>}
      </div>
    </MLink>
  );
}
