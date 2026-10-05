import Link from "next/link";

import { cn } from "../cn";
import { IconChevron } from "../icons";

export type SectionHeaderProps = {
  title: string;
  /** Ссылка справа: «Все», «Сменить цель». */
  action?: { label: string; href: string };
  className?: string;
};

/** Заголовок секции экрана с необязательной ссылкой справа. */
export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="t-heading text-fg-strong">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="focus-ring t-label -mr-2 flex items-center gap-0.5 rounded-full px-2 py-1 text-ink-600 transition-colors hover:bg-ink-50"
        >
          {action.label}
          <IconChevron size={14} weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  );
}
