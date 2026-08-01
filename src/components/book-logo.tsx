import { BookOpen } from "lucide-react";

/** Логотип приложения: синяя книга в белом скруглённом квадрате. */
export function BookLogo({ className }: { className?: string }) {
  return (
    <div
      className={`flex size-20 items-center justify-center rounded-[22px] border border-line/60 bg-white text-blue-500 shadow-sm ${className ?? ""}`}
    >
      <BookOpen size={40} strokeWidth={1.8} />
    </div>
  );
}
