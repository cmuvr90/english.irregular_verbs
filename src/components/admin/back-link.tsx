import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/** Надзаголовок страницы-карточки: ссылка обратно к списку. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 hover:underline">
      <ArrowLeft className="size-3" />
      {children}
    </Link>
  );
}
