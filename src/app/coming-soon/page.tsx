import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Скоро" };

/** Заглушка для разделов, которых пока нет: демо-ссылки кабинета ведут сюда. */
export default async function ComingSoonPage() {
  await requireSession();

  return (
    <main className="flex flex-1 items-center justify-center bg-white px-5">
      <div className="flex w-full max-w-md flex-col items-center pb-16 text-center">
        <div className="flex size-24 items-center justify-center rounded-[28px] border border-line/60 bg-white shadow-sm">
          <RocketIcon />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Скоро!</h1>
        <p className="mt-2 max-w-72 text-subtle">
          Этот раздел ещё в разработке — совсем скоро здесь появится что-то полезное.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 rounded-2xl bg-blue-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Вернуться в кабинет
        </Link>
      </div>
    </main>
  );
}

function RocketIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15c-1.5-.4-2.6-1.5-3-3 .8-3.6 3-6.7 6.5-8.5 1.5-.8 3.2-1.2 4.6-1-.1 1.5-.4 3.2-1.2 4.7-1.8 3.4-3.4 6-6.9 7.8Z"
        fill="#3b82f6"
      />
      <circle cx="15.2" cy="8.8" r="1.6" fill="#eff6ff" />
      <path
        d="M9 12c-1.6 0-3.2 1-4 2.5 1-.2 1.9-.1 2.6.3M12 15c0 1.6-1 3.2-2.5 4 .2-1 .1-1.9-.3-2.6"
        stroke="#60a5fa"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="m5.5 18.5-1 1M8 20l-.5.5M4 16l-.5.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
