/**
 * Тоны — общий язык цвета для примитивов. Компонент принимает tone="v2",
 * а какие классы за этим стоят, решается здесь. Классы записаны целиком,
 * чтобы Tailwind нашёл их при сканировании исходников.
 */
export type Tone = "ink" | "v1" | "v2" | "v3" | "success" | "danger" | "gold" | "mist";

export const tones: Tone[] = ["ink", "v1", "v2", "v3", "success", "danger", "gold", "mist"];

/** Мягкая подложка + насыщенный текст: чипы, плашки иконок. */
export const toneSoft: Record<Tone, string> = {
  ink: "bg-ink-100 text-ink-700",
  v1: "bg-v1-100 text-v1-800",
  v2: "bg-v2-100 text-v2-700",
  v3: "bg-v3-100 text-v3-700",
  success: "bg-success-100 text-success-700",
  danger: "bg-danger-100 text-danger-700",
  gold: "bg-gold-100 text-gold-800",
  mist: "bg-mist-100 text-mist-700",
};

/** Градиентная заливка — для акцентных плашек и карточек. */
export const toneGradient: Record<Tone, string> = {
  ink: "bg-grad-ink text-white",
  v1: "bg-grad-dawn text-white",
  v2: "bg-grad-sunset text-white",
  v3: "bg-grad-dusk text-white",
  success: "bg-grad-leaf text-white",
  danger: "bg-grad-berry text-white",
  gold: "bg-grad-gold text-gold-950",
  mist: "bg-grad-mist text-white",
};

/** Цвет текста/иконки тона на светлом фоне. */
export const toneText: Record<Tone, string> = {
  ink: "text-ink-600",
  v1: "text-v1-700",
  v2: "text-v2-600",
  v3: "text-v3-600",
  success: "text-success-600",
  danger: "text-danger-600",
  gold: "text-gold-700",
  mist: "text-mist-600",
};

/** Плотный цвет для заливок прогресса и точек. */
export const toneFill: Record<Tone, string> = {
  ink: "bg-ink-500",
  v1: "bg-v1-500",
  v2: "bg-v2-500",
  v3: "bg-v3-500",
  success: "bg-success-500",
  danger: "bg-danger-500",
  gold: "bg-gold-400",
  mist: "bg-mist-400",
};

/** Цвета для SVG-градиентов (кольца прогресса): начало и конец. */
export const toneStops: Record<Tone, [string, string]> = {
  ink: ["var(--color-ink-400)", "var(--color-orchid-600)"],
  v1: ["var(--color-dawn-300)", "var(--color-dawn-600)"],
  v2: ["var(--color-gold-400)", "var(--color-coral-600)"],
  v3: ["var(--color-orchid-400)", "var(--color-orchid-700)"],
  success: ["var(--color-leaf-300)", "var(--color-leaf-600)"],
  danger: ["var(--color-berry-300)", "var(--color-berry-600)"],
  gold: ["var(--color-gold-200)", "var(--color-gold-500)"],
  mist: ["var(--color-mist-300)", "var(--color-mist-600)"],
};
