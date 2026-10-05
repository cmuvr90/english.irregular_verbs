import type { Metadata } from "next";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { requireSession } from "@/lib/session";
import { IconRocket } from "@/ui/icons";
import { buttonClass } from "@/ui/primitives/button-styles";
import { IconTile } from "@/ui/primitives/icon-tile";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.comingSoon };
}

/** Заглушка для разделов, которых пока нет: демо-ссылки кабинета ведут сюда. */
export default async function ComingSoonPage() {
  await requireSession();
  const dict = await getDictionary(await getLocale());

  return (
    <main className="bg-dots relative flex flex-1 items-center justify-center bg-canvas px-4">
      <div className="flex w-full max-w-md flex-col items-center pb-16 text-center">
        <IconTile icon={IconRocket} tone="ink" variant="solid" size="xl" className="animate-float shadow-glow-ink" />

        <h1 className="t-title mt-7 text-fg-strong">{dict.comingSoon.title}</h1>
        <p className="t-body mt-2 max-w-72 text-fg-muted">{dict.comingSoon.text}</p>

        <Link href="/dashboard" className={buttonClass({ variant: "primary", size: "lg", className: "mt-8" })}>
          {dict.comingSoon.back}
        </Link>
      </div>
    </main>
  );
}
