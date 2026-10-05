import { cn } from "../cn";
import { Illustration } from "../primitives/illustration";

export type EmptyStateProps = {
  title: string;
  text?: string;
  illustration?: { src: string; alt: string };
  /** Кнопка или ссылка действия. */
  action?: React.ReactNode;
  className?: string;
};

/** Пустой экран/список: иллюстрация на точечной сетке, текст и одно действие. */
export function EmptyState({ title, text, illustration, action, className }: EmptyStateProps) {
  return (
    <div className={cn("bg-dots flex flex-col items-center rounded-2xl px-6 py-10 text-center", className)}>
      {illustration && (
        <Illustration src={illustration.src} alt={illustration.alt} width={240} height={240} className="w-40" />
      )}
      <h3 className="t-heading mt-5 text-fg-strong">{title}</h3>
      {text && <p className="t-body-sm mt-1.5 max-w-xs text-fg-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
