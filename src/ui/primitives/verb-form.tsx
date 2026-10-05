import { cn } from "../cn";

export type Form = "v1" | "v2" | "v3";

/** Подписи форм по-английски: это термины грамматики, их не переводим. */
export const formNames: Record<Form, string> = {
  v1: "Infinitive",
  v2: "Past Simple",
  v3: "Past Participle",
};

const styles: Record<Form, { chip: string; text: string; dot: string }> = {
  v1: { chip: "bg-v1-50 text-v1-800 ring-v1-200", text: "text-v1-700", dot: "bg-grad-dawn" },
  v2: { chip: "bg-v2-50 text-v2-700 ring-v2-200", text: "text-v2-600", dot: "bg-grad-sunset" },
  v3: { chip: "bg-v3-50 text-v3-700 ring-v3-200", text: "text-v3-600", dot: "bg-grad-dusk" },
};

export type VerbFormProps = {
  form: Form;
  /** Слово в этой форме; без него рисуется только метка формы. */
  word?: string;
  /** chip — пилюля с меткой; text — слово цветом формы; label — метка «V2 · Past Simple». */
  variant?: "chip" | "text" | "label";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const wordSizes = { sm: "text-sm", md: "text-lg", lg: "text-3xl" } as const;

/**
 * Форма глагола в фирменном цвете «времени суток». Единственный способ
 * показать V1/V2/V3 в интерфейсе — цвета форм нигде больше не задаются.
 */
export function VerbForm({ form, word, variant = "chip", size = "md", className }: VerbFormProps) {
  const s = styles[form];

  if (variant === "label") {
    return (
      <span className={cn("t-overline inline-flex items-center gap-1.5", s.text, className)}>
        <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
        {form.toUpperCase()} · {formNames[form]}
      </span>
    );
  }

  if (variant === "text") {
    return <span className={cn("t-verb", wordSizes[size], s.text, className)}>{word}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full ring-1 ring-inset",
        size === "sm" ? "h-7 pr-3 pl-1 text-xs" : size === "md" ? "h-9 pr-4 pl-1.5 text-sm" : "h-12 pr-5 pl-2 text-lg",
        s.chip,
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-bold text-white",
          size === "sm" ? "size-5 text-[9px]" : size === "md" ? "size-6 text-[10px]" : "size-8 text-xs",
          s.dot,
        )}
      >
        {form.toUpperCase()}
      </span>
      {word ? <span className="t-verb">{word}</span> : <span className="font-semibold">{formNames[form]}</span>}
    </span>
  );
}
