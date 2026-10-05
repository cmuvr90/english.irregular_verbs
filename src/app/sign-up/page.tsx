import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { AuthHero } from "@/components/auth-hero";
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
    <main className="relative flex-1 overflow-hidden bg-canvas">
      <div className="bg-aurora animate-aurora pointer-events-none absolute inset-x-0 top-0 h-[30rem] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-4 pt-6 pb-8">
        <div className="mb-6 flex w-full justify-end">
          <LanguageSwitcher current={locale} label={dict.common.language} />
        </div>

        <AuthHero title={dict.auth.signUpTitle} subtitle={dict.auth.signUpSubtitle} />

        <div className="mt-8 w-full">
          <AuthCard mode="sign-up" dict={dict.auth} />
        </div>
      </div>
    </main>
  );
}
