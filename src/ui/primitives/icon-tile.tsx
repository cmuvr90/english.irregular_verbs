import { cn } from "../cn";
import type { Icon } from "../icons";
import { type Tone, toneGradient, toneSoft } from "../tones";

const sizes = {
  sm: { box: "size-9 rounded-sm", icon: 18 },
  md: { box: "size-12 rounded-md", icon: 24 },
  lg: { box: "size-14 rounded-lg", icon: 28 },
  xl: { box: "size-20 rounded-2xl", icon: 40 },
} as const;

export type IconTileProps = {
  icon: Icon;
  tone?: Tone;
  /** soft — пастельная плашка; solid — градиент с зерном и бликом. */
  variant?: "soft" | "solid";
  size?: keyof typeof sizes;
  className?: string;
};

/** Цветная плашка со смысловой иконкой: статистика, тренажёры, быстрый доступ. */
export function IconTile({ icon: Glyph, tone = "ink", variant = "soft", size = "md", className }: IconTileProps) {
  const s = sizes[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        s.box,
        variant === "soft" ? toneSoft[tone] : cn("grain inset-shadow-highlight shadow-sm", toneGradient[tone]),
        className,
      )}
    >
      <Glyph size={s.icon} weight={variant === "soft" ? "duotone" : "fill"} aria-hidden />
    </span>
  );
}
