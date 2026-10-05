"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { IconMastered, IconSpeaker } from "../icons";
import { fadeUp, stagger } from "../motion/presets";
import { Badge } from "../primitives/badge";
import { Card } from "../primitives/card";
import { IconButton } from "../primitives/icon-button";
import { type Form, VerbForm } from "../primitives/verb-form";

export type VerbCardProps = {
  forms: Record<Form, string>;
  translation: string;
  /** Подпись кнопки озвучки (нужна варианту full). */
  speakLabel?: string;
  onSpeak?: (form: Form) => void;
  status?: { tone: "success" | "danger" | "ink"; label: string };
  /** compact — строка списка глаголов; full — карточка глагола. */
  variant?: "full" | "compact";
  className?: string;
};

const order: Form[] = ["v1", "v2", "v3"];

/** Глагол целиком: три формы цветами «времени суток», перевод, озвучка. */
export function VerbCard({ forms, translation, speakLabel, onSpeak, status, variant = "full", className }: VerbCardProps) {
  if (variant === "compact") {
    return (
      <Card padding="sm" className={cn("flex items-center gap-3", className)}>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {order.map((f, i) => (
              <span key={f} className="flex items-baseline gap-2">
                <VerbForm form={f} word={forms[f]} variant="text" size="sm" className="text-base" />
                {i < 2 && <span className="text-fg-faint">·</span>}
              </span>
            ))}
          </p>
          <p className="t-caption mt-0.5 text-fg-muted">{translation}</p>
        </div>
        {status && (
          <Badge tone={status.tone} size="sm" icon={status.tone === "success" ? IconMastered : undefined}>
            {status.label}
          </Badge>
        )}
      </Card>
    );
  }

  return (
    <Card padding="lg" className={cn("overflow-hidden", className)}>
      {/* полоска «рассвет → закат → сумерки» сверху — подпись темы */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-grad-day" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="t-title text-fg-strong">{forms.v1}</p>
          <p className="t-body-sm mt-1 text-fg-muted">{translation}</p>
        </div>
        {status && (
          <Badge tone={status.tone} icon={status.tone === "success" ? IconMastered : undefined}>
            {status.label}
          </Badge>
        )}
      </div>

      <m.ul variants={stagger(0.08)} initial="hidden" animate="show" className="mt-5 flex flex-col gap-2">
        {order.map((f) => (
          <m.li key={f} variants={fadeUp} className="flex items-center justify-between gap-3 rounded-lg bg-surface-sunken/70 py-2.5 pr-2.5 pl-4">
            <div className="flex flex-col gap-1">
              <VerbForm form={f} variant="label" />
              <VerbForm form={f} word={forms[f]} variant="text" size="md" className="text-2xl" />
            </div>
            <IconButton icon={IconSpeaker} label={speakLabel ? `${speakLabel}: ${forms[f]}` : forms[f]} variant="paper" size="sm" onClick={() => onSpeak?.(f)} />
          </m.li>
        ))}
      </m.ul>
    </Card>
  );
}
