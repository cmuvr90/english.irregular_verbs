import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { BookLogo } from "@/components/book-logo";
import { CalendarCheck, ChartColumn, Flame, Heart } from "lucide-react";
import { InstallPrompt } from "@/components/install-prompt";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Mascot } from "@/components/mascot";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export default async function Home() {
  // Авторизованным стартовый экран не нужен — сразу в кабинет.
  const session = await getSession();
  if (session) redirect("/dashboard");

  const locale = await getLocale();
  const dict = await getDictionary(locale);

  const features = [
    { icon: <CalendarCheck size={22} />, chip: "bg-green-100 text-green-600", label: dict.home.featureDaily },
    { icon: <Flame size={22} />, chip: "bg-orange-100 text-orange-500", label: dict.home.featureStreak },
    { icon: <ChartColumn size={22} />, chip: "bg-violet-100 text-violet-600", label: dict.home.featureProgress },
  ];

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-6 pb-8">
        <div className="mb-4 flex w-full justify-end">
          <LanguageSwitcher current={locale} />
        </div>

        <BookLogo />

        <h1 className="mt-5 text-center text-4xl font-bold tracking-tight">
          {dict.common.appName}
        </h1>
        <p className="mt-2 max-w-60 text-center text-lg leading-snug text-subtle">
          {dict.common.tagline}
        </p>

        <Mascot className="mt-2 w-full max-w-sm" />

        <AuthCard mode="sign-in" dict={dict.auth} />

        {/* преимущества */}
        <div className="mt-5 w-full rounded-3xl border border-line/60 bg-white p-5">
          <ul className="grid grid-cols-3 divide-x divide-line/70">
            {features.map((f) => (
              <li key={f.label} className="flex flex-col items-center gap-2 px-2 text-center">
                <span className={`flex size-11 items-center justify-center rounded-2xl ${f.chip}`}>
                  {f.icon}
                </span>
                <span className="text-xs leading-tight text-foreground/80">{f.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-subtle">
            <Heart size={18} className="text-blue-500" fill="currentColor" />
            {dict.home.footer}
          </p>
        </div>

        <InstallPrompt dict={dict.install} />
      </div>
    </main>
  );
}
