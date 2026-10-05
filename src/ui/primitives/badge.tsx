import { cn } from "../cn";
import type { Icon } from "../icons";
import { type Tone, toneGradient, toneSoft, toneText } from "../tones";

export type BadgeProps = {
  tone?: Tone;
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  icon?: Icon;
  className?: string;
  children: React.ReactNode;
};

/** Пилюля-метка: уровень, статус глагола, «новое», +XP. */
export function Badge({ tone = "ink", variant = "soft", size = "md", icon: Glyph, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-xs",
        variant === "soft" && toneSoft[tone],
        variant === "solid" && cn("shadow-xs", toneGradient[tone]),
        variant === "outline" && cn("bg-surface ring-1 ring-current/25", toneText[tone]),
        className,
      )}
    >
      {Glyph && <Glyph size={size === "sm" ? 12 : 14} weight="fill" aria-hidden />}
      {children}
    </span>
  );
}
