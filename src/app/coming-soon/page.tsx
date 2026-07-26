import type { Metadata } from "next";
import Link from "next/link";

import { RocketIcon } from "@/components/icons";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.comingSoon };
}

/** Заглушка для разделов, которых пока нет: демо-ссылки кабинета ведут сюда. */
export default async function ComingSoonPage() {
  await requireSession();
  const dict = await getDictionary(await getLocale());

  return (
    <main className="flex flex-1 items-center justify-center bg-white px-5">
      <div className="flex w-full max-w-md flex-col items-center pb-16 text-center">
        <div className="flex size-24 items-center justify-center rounded-[28px] border border-line/60 bg-white shadow-sm">
          <RocketIcon />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{dict.comingSoon.title}</h1>
        <p className="mt-2 max-w-72 text-subtle">{dict.comingSoon.text}</p>

        <Link
          href="/dashboard"
          className="mt-8 rounded-2xl bg-blue-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
        >
          {dict.comingSoon.back}
        </Link>
      </div>
    </main>
  );
}
