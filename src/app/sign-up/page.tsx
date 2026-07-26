import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { BookLogo } from "@/components/book-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.signUp };
}

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-6 pb-8">
        <div className="mb-4 flex w-full justify-end">
          <LanguageSwitcher current={locale} />
        </div>

        <BookLogo />

        <h1 className="mt-5 text-center text-4xl font-bold tracking-tight">
          {dict.auth.signUpTitle}
        </h1>
        <p className="mt-2 max-w-64 text-center text-lg leading-snug text-subtle">
          {dict.auth.signUpSubtitle}
        </p>

        <div className="mt-8 w-full">
          <AuthCard mode="sign-up" dict={dict.auth} />
        </div>
      </div>
    </main>
  );
}
