"use client";

import Link from "next/link";
import * as m from "motion/react-m";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { spring } from "../motion/presets";
import { Badge } from "../primitives/badge";
import { IconTile } from "../primitives/icon-tile";
import { Illustration } from "../primitives/illustration";
import { ProgressBar } from "../primitives/progress-bar";
import type { Tone } from "../tones";
import { ListLink } from "./list-link";

const MLink = m.create(Link);

export type TrainerCardProps = {
  name: string;
  description: string;
  href: string;
  icon: Icon;
  tone: Tone;
  /** 0–100 — сколько глаголов этого тренажёра выучено. */
  progress?: number;
  progressLabel?: string;
  badge?: string;
  /** Иллюстрация вместо иконки — для варианта «tile»; пока файла нет, видна иконка. */
  illustration?: { src: string; alt: string };
  /** row — строка списка; tile — крупная карточка-витрина. */
  variant?: "row" | "tile";
  className?: string;
};

export function TrainerCard({
  name,
  description,
  href,
  icon,
  tone,
  progress,
  progressLabel,
  badge,
  illustration,
  variant = "row",
  className,
}: TrainerCardProps) {
  if (variant === "tile") {
    return (
      <MLink
        href={href}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={spring.snappy}
        className={cn(
          "focus-ring group relative flex flex-col overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-hairline/70 transition-shadow hover:shadow-lg",
          className,
        )}
      >
        <div className="bg-aurora relative flex aspect-[4/3] items-center justify-center overflow-hidden">
          {illustration ? (
            <Illustration
              src={illustration.src}
              alt={illustration.alt}
              width={400}
              height={300}
              tone={tone}
              className="size-full rounded-none"
              fallback={<IconTile icon={icon} tone={tone} variant="solid" size="xl" />}
            />
          ) : (
            <IconTile icon={icon} tone={tone} variant="solid" size="xl" />
          )}
          {badge && (
            <Badge tone="gold" variant="solid" size="sm" className="absolute top-3 left-3">
              {badge}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="t-subheading text-fg-strong">{name}</p>
          <p className="t-caption line-clamp-2 text-fg-muted">{description}</p>
          {progress !== undefined && <ProgressBar value={progress} tone={tone} size="xs" className="mt-auto pt-0" label={progressLabel ?? name} />}
        </div>
      </MLink>
    );
  }

  return (
    <ListLink
      href={href}
      icon={icon}
      tone={tone}
      title={name}
      description={description}
      badge={
        badge && (
          <Badge tone="gold" variant="solid" size="sm">
            {badge}
          </Badge>
        )
      }
      progress={progress}
      progressLabel={progressLabel}
      className={className}
    />
  );
}
