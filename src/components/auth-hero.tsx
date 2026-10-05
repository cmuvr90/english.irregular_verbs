import { IconVerbs } from "@/ui/icons";
import { IconTile } from "@/ui/primitives/icon-tile";

/**
 * Шапка экранов входа и регистрации: логотип-плашка, заголовок и подзаголовок
 * на мягком «северном сиянии».
 */
export function AuthHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconTile icon={IconVerbs} tone="ink" variant="solid" size="xl" className="shadow-glow-ink" />
      <h1 className="t-display mt-6 text-fg-strong">{title}</h1>
      <p className="t-body mt-2 max-w-64 text-fg-muted">{subtitle}</p>
    </div>
  );
}
