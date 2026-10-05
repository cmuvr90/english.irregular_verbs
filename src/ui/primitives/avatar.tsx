import Image from "next/image";

import { cn } from "../cn";

const sizes = { sm: "size-8 text-xs", md: "size-11 text-sm", lg: "size-16 text-lg", xl: "size-24 text-2xl" } as const;
const pixels = { sm: 32, md: 44, lg: 64, xl: 96 } as const;

// Без фото аватар красится в одно из «небес» — стабильно для одного имени.
const skies = ["bg-grad-dawn", "bg-grad-sunset", "bg-grad-dusk", "bg-grad-ink", "bg-grad-leaf"];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  /** Кольцо вокруг аватара: «онлайн», лидер недели. */
  ring?: "none" | "gold" | "ink";
  className?: string;
};

export function Avatar({ name, src, size = "md", ring = "none", className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold text-white ring-offset-2 ring-offset-canvas",
        sizes[size],
        !src && cn("grain", skies[hash(name) % skies.length]),
        ring === "gold" && "ring-2 ring-gold-400",
        ring === "ink" && "ring-2 ring-ink-500",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={name} width={pixels[size]} height={pixels[size]} className="size-full object-cover" />
      ) : (
        <span aria-label={name}>{initials}</span>
      )}
    </span>
  );
}
