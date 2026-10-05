import { cn } from "../cn";

/** Заглушка на время загрузки: утопленная плашка с бегущим бликом. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("shimmer rounded-md bg-surface-sunken", className)} />;
}
