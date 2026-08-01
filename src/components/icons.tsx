/**
 * Кастомные иллюстрации приложения. Обычные иконки берём из lucide-react —
 * здесь остаётся только то, чему в библиотеке нет аналога.
 */

type IconProps = {
  size?: number;
  className?: string;
};

/** Мишень со стрелой для карточки «Сегодня». */
export function TargetBoard({ size = 92, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={`shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      <ellipse cx="48" cy="86" rx="26" ry="5" fill="#93c5fd" opacity="0.4" />
      <path d="M20 82 q6 -8 12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M76 82 q-6 -8 -12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="48" r="34" fill="#3b82f6" />
      <circle cx="48" cy="48" r="26" fill="#ffffff" />
      <circle cx="48" cy="48" r="18" fill="#60a5fa" />
      <circle cx="48" cy="48" r="10" fill="#ffffff" />
      <circle cx="48" cy="48" r="4.5" fill="#2563eb" />
      <path d="M48 48 76 20" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 20 88 17 79 8 76 20Z" fill="#f59e0b" />
    </svg>
  );
}
