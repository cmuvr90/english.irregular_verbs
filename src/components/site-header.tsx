import Link from "next/link";

import { getSession } from "@/lib/session";

import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          starter
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="text-subtle hover:text-foreground">
                Кабинет
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-subtle hover:text-foreground">
                Вход
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-foreground px-3 py-1.5 font-medium text-background transition-opacity hover:opacity-90"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
